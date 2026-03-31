<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Book;
use App\Models\Copy;
use App\Models\Library;
use App\Models\Incident;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\Loan;
use App\Models\Notification;
use App\Models\Penalty;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // if ($user->role == 'admin') {
        //     return Loan::with(['user', 'copy.book'])->get();
        // }

        return Loan::with(['copy.book'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Store a newly created resource in storage.
     */
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
                'message' => "Limite d'emprunt atteinte ({$maxAllowed} livres). Votre rang actuel est : " . ($user->badge->name ?? 'Lecteur débutant') . ".",
                'max_allowed' => $maxAllowed,
                'current_loans' => $currentLoansCount
            ], 403);
        }

        // 3. Inscription à la bibliothèque
        if (!$user->inscriptions()->where('library_id', $book->library_id)->exists()) {
            return response()->json([
                'message' => "Vous devez rejoindre la bibliothèque '{$library->name}' pour emprunter."
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
                'message' => "Vous avez déjà un exemplaire de ce livre en votre possession."
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
                    'loan_date' => now(),
                    'expected_return_date' => now()->addDays($library->loan_duration),
                ]);

                $returnDate = \Carbon\Carbon::parse($loan->expected_return_date)->format('d/m/Y');

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'loan_success',
                    'message' => "Emprunt réussi ! À rendre avant le {$returnDate}. " .
                                "Pénalité de {$library->daily_penalty_amount} FCFA/jour en cas de retard.",
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
                    'status' => 'active'
                ]);

                return response()->json([
                    'message' => 'Aucun exemplaire disponible. Vous avez été ajouté à la liste d\'attente.',
                    'reservation' => $reservation
                ], 202);
            }
        });
    }

    
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'amount' => 'nullable|numeric',
            'reason' => 'nullable|string',
        ]);

        $loan = Loan::with(['copy.book', 'user'])->find($id);

        if (!$loan || $loan->actual_return_date) {
            return response()->json(['message' => 'Prêt invalide ou déjà clos'], 422);
        }

        return DB::transaction(function () use ($loan, $request) {
            $now = now();
            $user = $loan->user;
            $copy = $loan->copy;
            $book = $copy->book;

            $loan->update(['actual_return_date' => $now]);

            $firstReservation = Reservation::where('book_id', $book->id)
                ->where('status', 'active')
                ->orderBy('created_at', 'asc')
                ->first();

            if ($firstReservation) {
                $copy->update(['status' => 'réservé']);
                $firstReservation->update([
                    'status' => 'notified',
                    'expires_at' => $now->addHours(24)
                ]);

                Notification::create([
                    'user_id' => $firstReservation->user_id,
                    'type' => 'book_available',
                    'message' => "Bonne nouvelle ! Le livre '{$book->title}' est disponible : vous avez 24h pour venir le récupérer en bibliothèque.",
                    'object_type' => 'book',
                    'object' => $book->id,
                    'date_sent' => now(),
                ]);
            } else {
                $copy->update(['status' => 'disponible']);
                $book->increment('nb_available');
            }

            $isLate = $now->greaterThan($loan->expected_return_date);
            if ($isLate) {
                $user->decrement('score');
            } else {
                $user->increment('score');
            }

            $this->refreshUserGrade($user);

            $penalty = null;
            if ($isLate || $request->has('amount')) {
                $penalty = Penalty::create([
                    'user_id' => $user->id,
                    'loan_id' => $loan->id,
                    'amount' => $request->amount,
                    'reason' => $request->reason,
                    'status' => 'non payé',
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'penalty',
                    'message' => "Une pénalité de {$request->amount} FCFA a été ajoutée. Raison : {$request->reason}",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => now(),
                ]);
            }

            return response()->json([
                'message' => "Retour validé par le bibliothécaire",
                'new_score' => $user->score,
                'penalty' => $penalty
            ], 200);
        });
    }

    public function returnBook(Request $request, $loanId)
    {
        $request->validate([
            'condition_on_return' => 'required|in:neuf,bon,abimé,très abimé'
        ]);

        return DB::transaction(function () use ($loanId, $request) {
            $loan = Loan::with(['copy.book', 'user'])->findOrFail($loanId);
            $copy = $loan->copy;
            $book = $copy->book;

            $loan->update([
                'actual_return_date' => now(),
                'condition_on_return' => $request->condition_on_return
            ]);

            $copy->update(['condition' => $request->condition_on_return]);

            $nextReservation = Reservation::where('book_id', $book->id)
                ->where('status', 'active')
                ->orderBy('created_at', 'asc')
                ->first();

            if ($nextReservation) {
                $copy->update(['status' => 'réservé']);
                $nextReservation->update([
                    'status' => 'notified',
                    'expires_at' => now()->addHours(24)
                ]);

                Notification::create([
                    'user_id' => $nextReservation->user_id,
                    'type' => 'book_available',
                    'message' => "Bonne nouvelle ! Le livre '{$book->title}' est disponible. Vous avez 24h pour venir le récupérer.",
                    'object_type' => 'reservation',
                    'object' => $nextReservation->id,
                ]);
            } else {
                $copy->update(['status' => 'disponible']);
                $book->increment('nb_available');
            }

            return response()->json(['message' => 'Livre retourné avec succès.']);
        });
    }


    /**
     * Remove the specified resource from storage.
     */
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
                'message' => "Felicitation ! Vous avez atteint le rang {$newBadge->name}",
                'object_type' => "badge",
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

        // On récupère les bibliothèques où l'utilisateur est membre interne
        $myLibraryIds = Inscription::where('user_id', $user->id)->pluck('library_id');

        // On ne montre que les incidents de ces bibliothèques
        $incidents = Incident::whereIn('library_id', $myLibraryIds)
            ->with(['user:id,name,email', 'loan.copy.book'])
            ->get();

        return response()->json($incidents);
    }
}
