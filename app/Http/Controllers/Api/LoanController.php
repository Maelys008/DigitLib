<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Book;
use App\Models\CopyState;
use App\Models\Incident;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\Loan;
use App\Models\Notification;
use App\Models\Penalty;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Loan::with(['copy.book', 'copy.copyState', 'returnCopyState'])
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
            ->where('status', 'non_payé')
            ->exists();

        if ($hasUnpaidPenalties) {
            return response()->json(['message' => 'Emprunt bloqué : Vous avez des pénalités non payées.'], 403);
        }

        // 2. Limite d'emprunt via badge
        $user->load('badge');
        $maxAllowed = $user->badge->maximum_book ?? 1;
        $currentLoansCount = $user->loans()
            ->whereIn('status', [Loan::STATUS_PENDING_PICKUP, Loan::STATUS_IN_PROGRESS, Loan::STATUS_RESERVED])
            ->count();

        if ($currentLoansCount >= $maxAllowed) {
            return response()->json([
                'message' => "Limite d'emprunt atteinte ({$maxAllowed} livres). Votre rang actuel est : ".($user->badge->name ?? 'Lecteur débutant').'.',
                'max_allowed' => $maxAllowed,
                'current_loans' => $currentLoansCount,
            ], 403);
        }

        // 3. Déjà un exemplaire de ce livre en cours
        $alreadyHasBook = Loan::where('user_id', $user->id)
            ->whereIn('status', [Loan::STATUS_PENDING_PICKUP, Loan::STATUS_IN_PROGRESS, Loan::STATUS_RESERVED])
            ->whereHas('copy', function ($query) use ($book) {
                $query->where('book_id', $book->id);
            })
            ->exists();

        if ($alreadyHasBook) {
            return response()->json([
                'message' => 'Vous avez déjà un exemplaire de ce livre en votre possession ou en attente.',
            ], 422);
        }

        // 4. Transaction emprunt / file d'attente
        return DB::transaction(function () use ($user, $book, $library) {
            $copy = $book->copies()
                ->where('status', 'disponible')
                ->lockForUpdate()
                ->first();

            if ($copy) {
                // Exemplaire disponible → en_attente_de_retrait
                $loan = Loan::create([
                    'user_id' => $user->id,
                    'copy_id' => $copy->id,
                    'status' => Loan::STATUS_PENDING_PICKUP,
                    'pickup_deadline' => now()->addHours(24),
                    'expected_return_date' => now()->addDays($library->loan_duration),
                ]);

                $copy->update(['status' => 'réservée']);
                $book->decrement('nb_available');

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'loan_success',
                    'message' => 'Emprunt confirmé ! Venez récupérer le livre avant le '
                        .Carbon::parse($loan->pickup_deadline)->format('d/m/Y H:i')
                        .". Passé ce délai, l'emprunt sera annulé automatiquement.",
                    'object_type' => 'loan',
                    'object_id' => $loan->id,
                    'date_sent' => now(),
                ]);

                return response()->json(['message' => 'Emprunt confirmé. Venez récupérer le livre dans les 24h.', 'loan' => $loan], 201);
            } else {
                // Aucun exemplaire disponible → file d'attente (réservée)
                $alreadyQueued = Loan::where('user_id', $user->id)
                    ->where('status', Loan::STATUS_RESERVED)
                    ->whereHas('copy', fn ($q) => $q->where('book_id', $book->id))
                    ->exists();

                if ($alreadyQueued) {
                    return response()->json(['message' => "Vous êtes déjà sur la liste d'attente pour ce livre."], 422);
                }

                // Prendre n'importe quel exemplaire du livre pour la file
                $anyCopy = $book->copies()->lockForUpdate()->first();

                $loan = Loan::create([
                    'user_id' => $user->id,
                    'copy_id' => $anyCopy->id,
                    'status' => Loan::STATUS_RESERVED,
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'waitlist',
                    'message' => "Aucun exemplaire disponible. Vous avez été ajouté à la liste d'attente pour \"{$book->title}\". Vous serez notifié dès qu'un exemplaire sera disponible.",
                    'object_type' => 'loan',
                    'object_id' => $loan->id,
                    'date_sent' => now(),
                ]);

                return response()->json([
                    'message' => "Aucun exemplaire disponible. Vous avez été ajouté à la liste d'attente.",
                    'loan' => $loan,
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
        $authUser = $request->user();

        // Seuls admin ou membres internes de la bibliothèque peuvent confirmer
        $libraryId = $loan->copy->book->library_id;
        $isStaff = Internal_member::where('user_id', $authUser->id)
            ->where('library_id', $libraryId)->exists()
            || Library::where('id', $libraryId)
                ->where('administrator_id', $authUser->id)->exists();

        if (! $isStaff) {
            return response()->json(['message' => 'Accès réservé au personnel de la bibliothèque.'], 403);
        }

        if ($loan->status !== Loan::STATUS_PENDING_PICKUP) {
            return response()->json(['message' => "Ce prêt n'est pas en attente de retrait."], 422);
        }

        $loan->update([
            'status' => Loan::STATUS_IN_PROGRESS,
            'loan_date' => now(),
        ]);

        $loan->copy->update(['status' => 'emprunté']);

        return response()->json(['message' => 'Prêt confirmé, le livre est maintenant en possession du lecteur.', 'loan' => $loan]);
    }

    public function returnBook(Request $request, $loanId)
{
    // Vérification avant validation
    if (! $request->has('return_copy_state_id')) {
        return response()->json([
            'message' => 'return_copy_state_id est manquant',
            'received' => $request->all(),
        ], 422);
    }
    
    $request->validate([
        'return_copy_state_id' => 'required|exists:copy_states,id',
        'additional_penalty_amount' => 'nullable|integer|min:1',
        'penalty_reason' => 'nullable|string|max:255',
    ]);

    return DB::transaction(function () use ($loanId, $request) {
        $loan = Loan::with(['copy.book.library', 'user'])->findOrFail($loanId);
        $returnValidatedBy = auth('sanctum')->user();

        // Seuls admin ou membres internes peuvent enregistrer un retour
        $libraryId = $loan->copy->book->library_id;
        $isStaff = Internal_member::where('user_id', $returnValidatedBy->id)
            ->where('library_id', $libraryId)->exists()
            || Library::where('id', $libraryId)
                ->where('administrator_id', $returnValidatedBy->id)->exists();

        if (! $isStaff) {
            return response()->json(['message' => 'Accès réservé au personnel de la bibliothèque.'], 403);
        }

        if ($loan->status !== Loan::STATUS_IN_PROGRESS) {
            return response()->json(['message' => "Ce prêt n'est pas en cours."], 422);
        }

        $now = now();
        $copy = $loan->copy;
        $book = $copy->book;
        $user = $loan->user;
        $library = $book->library;
        $returnStateId = $request->return_copy_state_id;
        
        // Récupérer l'état pour le libellé (utile pour les raisons)
        $returnState = CopyState::find($returnStateId);

        $loan->update([
            'actual_return_date' => $now,
            'return_copy_state_id' => $returnStateId,
            'returned_by' => $returnValidatedBy->id,
            'status' => Loan::STATUS_RETURNED,
        ]);

        // Mettre à jour l'état de l'exemplaire
        $copy->update(['copy_state_id' => $returnStateId]);

        // Gamification
        $pointsDelta = 0;
        $isLate = false;
        $expectedDate = Carbon::parse($loan->expected_return_date);
        $returnDate = $now->copy();

        if ($returnDate->gt($expectedDate)) {
            $isLate = true;
            $daysLate = max(1, (int) ceil($expectedDate->diffInMinutes($returnDate) / 1440));
            $pointsDelta = -min($daysLate * 2, 30);
        } elseif ($returnDate->lt($expectedDate)) {
            $daysEarly = (int) floor($returnDate->diffInMinutes($expectedDate) / 1440);
            $pointsDelta = 10 + min($daysEarly * 2, 10);
        } else {
            $pointsDelta = 10;
        }

        if ($pointsDelta !== 0) {
            $newScore = max(0, $user->score + $pointsDelta);
            $user->update(['score' => $newScore]);
            $this->refreshUserGrade($user);

            Notification::create([
                'user_id' => $user->id,
                'type' => $pointsDelta > 0 ? 'score_gain' : 'score_loss',
                'message' => $pointsDelta > 0
                    ? "Retour à temps ! Vous avez gagné {$pointsDelta} points. Score actuel : {$newScore} pts"
                    : 'Retard constaté. Vous avez perdu '.abs($pointsDelta)." points. Score actuel : {$newScore} pts",
                'object_type' => 'loan',
                'object_id' => $loan->id,
                'date_sent' => $now,
            ]);
        }

        // ============================================================
        // 🔥 MODIFICATION ICI : Plus de pénalité automatique pour dégradation
        // ============================================================
        
        $totalPenalty = 0;
        $reasons = [];
        
        // 🔥 Supprimé : $isDamaged = in_array($returnState->libelle_state, ['endommagé', 'très_endommagé']);
        // 🔥 Supprimé : le bloc qui ajoutait 2000 ou 5000 F automatiquement

        // 1. Pénalité de retard (si applicable)
        if ($isLate) {
            $daysLateForPenalty = max(1, $returnDate->diffInDays($expectedDate));
            $totalPenalty += $daysLateForPenalty * ($library->daily_penalty_amount ?? 0);
            $reasons[] = "Retard de {$daysLateForPenalty} jour(s)";
        }

        // 2. 🔥 NOUVEAU : Pénalité supplémentaire (uniquement ce que le bibliothécaire saisit)
        //    Peu importe l'état (neuf, bon, abimé, très abimé), c'est le bibliothécaire qui décide
        if ($request->filled('additional_penalty_amount') && $request->additional_penalty_amount > 0) {
            $totalPenalty += $request->additional_penalty_amount;
            $reasonText = $request->penalty_reason ?? "Frais supplémentaires";
            
            // Ajouter l'état du livre à la raison si pertinent
            if ($returnState && in_array($returnState->libelle_state, ['endommagé', 'très_endommagé'])) {
                $reasonText .= " (État : {$returnState->libelle_state})";
            }
            $reasons[] = $reasonText;
        }

        $totalPenalty = (int) $totalPenalty;
        $penalty = null;

        if ($totalPenalty > 0) {
            $penalty = Penalty::firstOrNew(['loan_id' => $loan->id]);
            $penalty->user_id = $user->id;
            $penalty->amount = $totalPenalty;
            $penalty->reason = implode(' | ', $reasons);
            $penalty->status = $penalty->status ?? 'non_payé';
            $penalty->save();

            $incident = Incident::create([
                'user_id' => $user->id,
                'library_id' => $library->id,
                'loan_id' => $loan->id,
                'title' => 'Sanction sur retour',
                'description' => 'Sanction générée : '.implode(' | ', $reasons),
                'date' => now(),
                'status' => 'ouvert',
                'notify_all_librarians' => false,
            ]);

            Notification::create([
                'user_id' => $user->id,
                'type' => 'penalty_final',
                'message' => "Livre rendu. Pénalité : {$totalPenalty} FCFA pour \"{$book->title}\".",
                'object_type' => 'loan',
                'object_id' => $loan->id,
                'date_sent' => $now,
            ]);
        }

        // Libération de l'exemplaire → chercher file d'attente (loans réservée)
        $nextInQueue = Loan::where('status', Loan::STATUS_RESERVED)
            ->whereHas('copy', fn ($q) => $q->where('book_id', $book->id))
            ->orderBy('created_at', 'asc')
            ->first();

        if ($nextInQueue) {
            // Réassigner cet exemplaire au suivant
            $nextInQueue->update([
                'copy_id' => $copy->id,
                'status' => Loan::STATUS_PENDING_PICKUP,
                'pickup_deadline' => $now->copy()->addHours(24),
                'expected_return_date' => $now->copy()->addDays($library->loan_duration),
            ]);

            $copy->update(['status' => 'réservée']);

            Notification::create([
                'user_id' => $nextInQueue->user_id,
                'type' => 'loan_success',
                'message' => "Le livre \"{$book->title}\" est disponible ! Venez le récupérer avant le "
                    .$nextInQueue->pickup_deadline->format('d/m/Y H:i').'.',
                'object_type' => 'loan',
                'object_id' => $nextInQueue->id,
                'date_sent' => $now,
            ]);
        } else {
            $copy->update(['status' => 'disponible']);
            $book->increment('nb_available');
        }

        $message = 'Livre retourné avec succès.';
        if ($totalPenalty > 0) {
            $message .= ' Pénalité de '.number_format($totalPenalty, 0, ',', ' ').' FCFA enregistrée.';
        }

        return response()->json([
            'message' => $message,
            'details' => [
                'is_late' => $isLate,
                'penalty_id' => $penalty?->id,
                'penalty_amount' => $totalPenalty,
                'validated_by' => $returnValidatedBy->name,
            ],
        ], 200);
    });
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
                'object_id' => $newBadge->id,
                'date_sent' => now(),
            ]);
        }
    }

    public function libraryDashboard(Request $request)
    {
        $user = $request->user();

        $libraryIds = $user->managedLibraries()->pluck('id');
        
        if ($libraryIds->isEmpty()) {
            return response()->json([]);
        }

        $loans = Loan::whereHas('copy.book', function ($q) use ($libraryIds, $request) {
            $q->whereIn('library_id', $libraryIds);
            if ($request->filled('library_id')) {
                $q->where('library_id', $request->library_id);
            }
        })
            ->with(['user:id,name,email', 'copy.book:id,title', 'copy.copyState', 'returnCopyState'])
            ->orderBy('expected_return_date', 'asc')
            ->get();

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

        $incidents = Incident::with([
            'user:id,name,email',
            'loan.copy.book:id,title,author',
            'library',
        ])
            ->whereIn('library_id', $myLibraryIds)
            ->where('status', '!=', 'résolue')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($incidents);
    }

    public function resolveIncident(Request $request, $id)
    {
        $authUser = $request->user();
        $incident = Incident::findOrFail($id);

        $incident->status = 'résolue';
        $incident->resolved_at = now();
        $incident->resolved_by = $authUser->id;
        $incident->save();

        return response()->json(['message' => 'Incident marqué comme résolu', 'incident' => $incident]);
    }

    public function userIncidents(Request $request)
    {
        $user = $request->user();

        $incidents = Incident::where('user_id', $user->id)
            ->with(['library', 'loan.copy.book'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($incidents);
    }
}