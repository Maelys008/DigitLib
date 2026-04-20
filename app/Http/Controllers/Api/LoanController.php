<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Book;
use App\Models\Incident;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\Loan;
use App\Models\Notification;
use App\Models\Penalty;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Loan::with(['copy.book'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
        ]);

        $user = $request->user();
        $book = Book::with(['library', 'copies'])->findOrFail($request->book_id);
        $library = $book->library;

        // 1. Pénalités impayées
        $hasUnpaidPenalties = Penalty::where('user_id', $user->id)
            ->where('status', 'non payé')
            ->exists();

        if ($hasUnpaidPenalties) {
            return response()->json(['message' => 'Emprunt bloqué : Vous avez des pénalités non payées.'], 403);
        }

        // 2. Limite d’emprunt via badge
        $user->load('badge');
        $maxAllowed = $user->badge->maximum_book ?? 1;
        $currentLoansCount = $user->loans()->whereNull('actual_return_date')->count();

        if ($currentLoansCount >= $maxAllowed) {
            return response()->json([
                'message' => "Limite d'emprunt atteinte ({$maxAllowed} livres). Votre rang actuel est : ".($user->badge->name ?? 'Lecteur débutant').'.',
                'max_allowed' => $maxAllowed,
                'current_loans' => $currentLoansCount,
            ], 403);
        }

        // 3. Inscription à la bibliothèque
        if (! $user->inscriptions()->where('library_id', $book->library_id)->exists()) {
            return response()->json([
                'message' => "Vous devez rejoindre la bibliothèque '{$library->name}' pour emprunter.",
            ], 403);
        }

        // 4. Déjà un exemplaire de ce livre
        $alreadyHasBook = Loan::where('user_id', $user->id)
            ->whereNull('actual_return_date')
            ->whereHas('copy', function ($query) use ($book) {
                $query->where('book_id', $book->id);
            })
            ->exists();

        if ($alreadyHasBook) {
            return response()->json([
                'message' => 'Vous avez déjà un exemplaire de ce livre en votre possession.',
            ], 422);
        }

        // 5. Transaction emprunt / réservation
        return DB::transaction(function () use ($user, $book, $library) {
            $existingReservation = Reservation::where('user_id', $user->id)
                ->where('book_id', $book->id)
                ->whereIn('status', ['active', 'notified'])
                ->first();

            $copy = $book->copies()
                ->where(function ($query) use ($user) {
                    $query->where('status', 'disponible')
                        ->orWhere(function ($q) use ($user) {
                            $q->where('status', 'réservé')
                                ->whereHas('book.reservations', function ($r) use ($user) {
                                    $r->where('user_id', $user->id)
                                        ->where('status', 'notified')
                                        ->where('expires_at', '>', now());
                                });
                        });
                })
                ->lockForUpdate()
                ->first();

            if ($copy) {
                // EMPRUNT
                if ($existingReservation) {
                    $existingReservation->update(['status' => 'completed']);
                }

                $loan = Loan::create([
                    'user_id' => $user->id,
                    'copy_id' => $copy->id,
                    'loan_date' => null,
                    'expected_return_date' => now()->addDays($library->loan_duration),
                    'status' => 'pending_pickup',
                    'pickup_deadline' => now()->addHours(24),
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'loan_success',
                    'message' => 'Emprunt réservé ! Venez récupérer le livre avant le '
                        .Carbon::parse($loan->pickup_deadline)->format('d/m/Y H:i')
                        .". Passé ce délai, l'emprunt sera annulé automatiquement.",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => now(),
                ]);

                $originalStatus = $copy->status;
                $copy->update(['status' => 'emprunté']);

                if ($originalStatus === 'disponible') {
                    $book->decrement('nb_available');
                }

                return response()->json(['message' => 'Livre emprunté avec succès', 'loan' => $loan], 201);
            } else {
                // RÉSERVATION
                if ($existingReservation) {
                    return response()->json(['message' => 'Vous êtes déjà sur la liste d\'attente pour ce livre.'], 422);
                }

                $reservation = Reservation::create([
                    'user_id' => $user->id,
                    'book_id' => $book->id,
                    'status' => 'active',
                ]);

                return response()->json([
                    'message' => 'Aucun exemplaire disponible. Vous avez été ajouté à la liste d\'attente.',
                    'reservation' => $reservation,
                ], 202);
            }
        });
    }

    public function show(string $id)
    {
        //
    }

    public function update()
    {
        //
    }

    public function confirmPickup(Request $request, Loan $loan)
    {
        if ($loan->status !== 'pending_pickup') {
            return response()->json(['message' => 'Ce prêt n\'est pas en attente de retrait.'], 422);
        }

        $loan->update([
            'status' => 'active',
            'loan_date' => now(),
        ]);

        Reservation::where('user_id', $loan->user_id)
            ->whereHas('book.copies', function ($q) use ($loan) {
                $q->where('id', $loan->copy_id);
            })
            ->where('status', 'notified')
            ->update(['status' => 'completed']);

        return response()->json(['message' => 'Prêt confirmé, le livre est maintenant en possession du lecteur.', 'loan' => $loan]);
    }

    public function returnBook(Request $request, $loanId)
    {
        $request->validate([
            'condition_on_return' => 'required|in:neuf,bon,abimé,très abimé',
            'additional_penalty_amount' => 'nullable|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($loanId, $request) {
            $loan = Loan::with(['copy.book.library', 'user'])->findOrFail($loanId);
            $returnValidatedBy = auth('sanctum')->user();

            if ($loan->actual_return_date) {
                return response()->json(['message' => 'Ce retour a déjà été enregistré.'], 422);
            }

            $now = now();
            $copy = $loan->copy;
            $book = $copy->book;
            $user = $loan->user;
            $library = $book->library;

            $loan->update([
                'actual_return_date' => $now,
                'condition_on_return' => $request->condition_on_return,
                'returned_by' => $returnValidatedBy->id,
            ]);
            $copy->update(['condition' => $request->condition_on_return]);

            $pointsDelta = 0;
            $isLate = false;

            if ($loan->status === 'active') {
                $expectedDate = Carbon::parse($loan->expected_return_date);
                $returnDate = $now->copy();

                if ($returnDate->gt($expectedDate)) {
                    $isLate = true;
                    $minutesLate = $expectedDate->diffInMinutes($returnDate);
                    $daysLate = ceil($minutesLate / 1440);
                    $daysLate = max(1, $daysLate);

                    $pointsLost = min($daysLate * 2, 30);
                    $pointsDelta = -$pointsLost;
                } elseif ($returnDate->lt($expectedDate)) {
                    $minutesEarly = $returnDate->diffInMinutes($expectedDate);
                    $daysEarly = floor($minutesEarly / 1440);

                    $bonus = min($daysEarly * 2, 10);
                    $pointsDelta = 10 + $bonus;
                } else {
                    $pointsDelta = 10;
                }

                if ($pointsDelta !== 0) {
                    $newScore = max(0, $user->score + $pointsDelta);
                    $user->update(['score' => $newScore]);

                    $this->refreshUserGrade($user);

                    if ($pointsDelta > 0) {
                        Notification::create([
                            'user_id' => $user->id,
                            'type' => 'score_gain',
                            'message' => "Retour à temps ! Vous avez gagné {$pointsDelta} points. Votre score actuel est donc de {$newScore} points",
                            'object_type' => 'loan',
                            'object' => $loan->id,
                            'date_sent' => $now,
                        ]);
                    } else {
                        $lost = abs($pointsDelta);
                        Notification::create([
                            'user_id' => $user->id,
                            'type' => 'score_loss',
                            'message' => "Retard sur le retour du livre. Vous avez perdu {$lost} points. Votre score actuel est donc de {$newScore} points",
                            'object_type' => 'loan',
                            'object' => $loan->id,
                            'date_sent' => $now,
                        ]);
                    }
                }
            }

            $totalPenalty = 0;
            $reasons = [];

            if ($isLate && $loan->status === 'active') {
                $daysLateForPenalty = $returnDate->diffInDays($expectedDate);
                if ($daysLateForPenalty > 0) {
                    $totalPenalty += $daysLateForPenalty * ($library->daily_penalty_amount ?? 0);
                    $reasons[] = "Retard de {$daysLateForPenalty} jour(s)";
                }
            }

            if ($request->filled('additional_penalty_amount')) {
                $totalPenalty += $request->additional_penalty_amount;
                $reasons[] = $request->penalty_reason
                    ?? "Frais de dégradation (État du livre : {$request->condition_on_return})";
            }

            $totalPenalty = (int) $totalPenalty;
            $penalty = null;

            if ($totalPenalty > 0) {
                $penalty = Penalty::firstOrNew(['loan_id' => $loan->id]);
                $penalty->user_id = $user->id;
                $penalty->amount = $totalPenalty;
                $penalty->reason = implode(' | ', $reasons);
                $penalty->status = $penalty->status ?? 'non payé';
                $penalty->save();

                $incident = Incident::create([
                    'user_id' => $user->id,
                    'library_id' => $library->id,
                    'loan_id' => $loan->id,
                    'description' => 'Sanction générée : '.implode(' | ', $reasons),
                    'date' => now(),
                    'is_library_record' => false,
                    'notify_all_librarians' => false,
                ]);

                // NOTIFICATION AU READER
                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'incident_recorded',
                    'message' => "Un incident a été enregistré sur votre compte pour le livre '{$book->title}'. Pénalité: {$totalPenalty} FCFA",
                    'object_type' => 'incident',
                    'object' => $incident->id,
                    'date_sent' => $now,
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'penalty_final',
                    'message' => "Livre rendu. Pénalité finale : {$totalPenalty} FCFA pour '{$book->title}'.",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => $now,
                ]);

                Notification::create([
                    'user_id' => $returnValidatedBy->id,
                    'type' => 'return_confirmation',
                    'message' => "Vous avez validé le retour de '{$book->title}' (Utilisateur: {$user->name}). Pénalité de {$totalPenalty} FCFA à percevoir.",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => $now,
                ]);
            }

            // Libération de l'exemplaire
            $nextReservation = Reservation::where('book_id', $book->id)
                ->whereIn('status', ['active', 'notified'])
                ->where(function($q) {
                    $q->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
                })
                ->orderBy('created_at', 'asc')
                ->first();

            if ($nextReservation) {
                if ($nextReservation->status === 'active') {
                    $nextReservation->update([
                        'status' => 'notified',
                        'expires_at' => $now->copy()->addHours(24),
                    ]);
                }
                
                $reservationUser = $nextReservation->user;
                
                $loanForNext = Loan::create([
                    'user_id' => $reservationUser->id,
                    'copy_id' => $copy->id,
                    'loan_date' => null,
                    'expected_return_date' => $now->copy()->addDays($library->loan_duration),
                    'status' => 'pending_pickup',
                    'pickup_deadline' => $now->copy()->addHours(24),
                ]);
                
                Notification::create([
                    'user_id' => $reservationUser->id,
                    'type' => 'loan_success',
                    'message' => 'Le livre "'.$book->title.'" est maintenant disponible. Venez le récupérer avant le '.$loanForNext->pickup_deadline->format('d/m/Y H:i'),
                    'object_type' => 'loan',
                    'object' => $loanForNext->id,
                    'date_sent' => $now,
                ]);
            } else {
                $copy->update(['status' => 'disponible']);
                $book->increment('nb_available');
            }

            $message = 'Livre retourné avec succès.';
            if ($totalPenalty > 0) {
                $message .= ' Une pénalité de '.number_format($totalPenalty, 0, ',', ' ').' FCFA a été enregistrée (Statut: Non payée).';
            }

            return response()->json([
                'message' => $message,
                'details' => [
                    'is_late' => $isLate,
                    'penalty_id' => $penalty ? $penalty->id : null,
                    'penalty_amount' => $totalPenalty,
                    'status' => 'Livre récupéré / Pénalité en attente de paiement',
                    'valided_by' => $returnValidatedBy->name,
                ],
            ], 200);
        });
    }

    public function destroy(string $id)
    {
        //
    }

    private function refreshUserGrade($user)
    {
        $newBadge = Badge::where('condition_of_obtaining', '<=', $user->score)
            ->orderBy('condition_of_obtaining', 'desc')
            ->first();

        if ($newBadge && $user->badge_id !== $newBadge->id) {
            $user->update(['badge_id' => $newBadge->id]);

            Notification::create([
                'user_id' => $user->id,
                'type' => 'badge_upgrade',
                'message' => "Félicitations ! Vous avez atteint le rang {$newBadge->name}",
                'object_type' => 'badge',
                'object' => $newBadge->name,
                'date_sent' => now(),
            ]);
        }
    }

    public function libraryDashboard(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $libraryIds = $user->managedLibraries()->pluck('id');

        $loansQuery = Loan::whereHas('copy.book', function ($q) use ($libraryIds, $request) {
            $q->whereIn('library_id', $libraryIds);
            if ($request->filled('library_id')) {
                $q->where('library_id', $request->library_id);
            }
        })
            ->with(['user:id,name,email', 'copy.book:id,title'])
            ->orderBy('expected_return_date', 'asc');

        $loans = $loansQuery->get();

        return response()->json($loans);
    }
public function libraryIncidents(Request $request)
{
    $user = $request->user();
    
    $myLibraryIds = Internal_member::where('user_id', $user->id)
        ->pluck('library_id')
        ->toArray();

    if (empty($myLibraryIds)) {
        return response()->json(['message' => 'Accès réservé au personnel de la bibliothèque.'], 403);
    }

    // 🔥 AFFICHE TOUS LES INCIDENTS (même ceux signalés au casier)
    $incidents = Incident::with([
        'user:id,name,email',
        'loan' => function ($query) {
            $query->with(['copy' => function ($q) {
                $q->with(['book' => function ($b) {
                    $b->select('id', 'title', 'author');
                }]);
            }]);
        },
        'library'
    ])
    ->whereIn('library_id', $myLibraryIds)
    ->where('status', '!=', 'resolved')
    ->orderBy('created_at', 'desc')
    ->get();

    return response()->json($incidents);
}
/**
 * Marquer un incident comme résolu
 */
public function resolveIncident(Request $request, $id)
{
    $authUser = $request->user();
    
    // Récupérer l'incident
    $incident = Incident::findOrFail($id);
    
    // Mise à jour directe (sans vérification d'accès pour tester)
    $incident->status = 'resolved';
    $incident->resolved_at = now();
    $incident->resolved_by = $authUser->id;
    $incident->save();
    
    return response()->json([
        'message' => 'Incident marqué comme résolu',
        'incident' => $incident
    ]);
}
}