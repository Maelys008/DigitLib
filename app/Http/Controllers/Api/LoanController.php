<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\Book;
use App\Models\Copy;
use App\Models\Loan;
use App\Models\Notification;
use App\Models\Penality;
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
        $book = Book::with('library')->find($request->book_id);

        $user->load('badge');
        $maxAllowed = $user->badge ? $user->badge->maximum_book : 2;
        $currentLoansCount = $user->loans()->whereNull('actual_return_date')->count();

        if ($currentLoansCount >= $maxAllowed) {
            return response()->json([
                'message' => "Limite d'emprunt atteinte ({$maxAllowed} livres). Votre rang actuel est : " . ($user->badge->name ?? 'Lecteur débutant') . ".",
                'max_allowed' => $maxAllowed,
                'current_loans' => $currentLoansCount
            ], 403);
        }


        if (!$user->inscriptions()->where('library_id', $book->library_id)->exists()) {
            return response()->json([
                'message' => "Vous devez rejoindre la bibliothèque '{$book->library->name}' pour emprunter."
            ], 403);
        }


        $alreadyHasBook = Loan::where('user_id', $user->id)
            ->whereNull('actual_return_date')->whereHas('copy', function ($query) use ($book) {
                $query->where('book_id', $book->id);
            })
            ->exists();

        if ($alreadyHasBook) {
            return response()->json([
                'message' => "Vous avez déjà un exemplaire de ce livre en votre possession."
            ], 422);
        }

        if ($book->nb_available > 0) {
            return DB::transaction(function () use ($user, $book) {
                $copy = $book->copies()->where('status', 'disponible')->first();

                if (!$copy) {
                    return response()->json(['message' => 'Erreur de synchronisation du stock.'], 500);
                }

                $loan = Loan::create([
                    'user_id' => $user->id,
                    'copy_id' => $copy->id,
                    'loan_date' => now(),
                    'expected_return_date' => now()->addDays(14),
                ]);

                $returnDate = \Carbon\Carbon::parse($loan->expected_return_date)->format('d/m/Y');
                $penaltyPerDay = 500;

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'loan_success',
                    'message' => "Emprunt réussi ! Vous devez rendre le livre avant le {$returnDate}. " .
                        "Au-delà, une pénalité journalière de {$penaltyPerDay} sera appliquée.",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => now(),
                ]);

                $copy->update(['status' => 'emprunté']);
                $book->decrement('nb_available');

                return response()->json(['message' => 'Livre emprunté', 'loan' => $loan], 201);
            });
        } else {
            $reservation = Reservation::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'status' => 'active'
            ]);
            return response()->json(['message' => 'Livre réservé', 'reservation' => $reservation], 202);
        }
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
            $book = $loan->copy->book;


            $loan->update(['actual_return_date' => $now]);
            $loan->copy->update(['status' => 'disponible']);
            $book->increment('nb_available');

            $firstReservation = Reservation::where('book_id', $book->id)
                ->where('status', 'active')
                ->orderBy('created_at', 'asc')
                ->first();

            if ($firstReservation) {
                Notification::create([
                    'user_id' => $firstReservation->user_id,
                    'type' => 'book_available',
                    'message' => "Bonne nouvelle ! Le livre '{$book->title}' que vous attendiez est de nouveau disponible.",
                    'object_type' => 'book',
                    'object' => $book->id,
                    'date_sent' => now(),
                ]);

                // pour ne pas envoyer 10 fois la notif si le livre repart et revient
                $firstReservation->update(['status' => 'notified']);
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
                $penalty = Penality::create([
                    'user_id' => $user->id,
                    'loan_id' => $loan->id,
                    'amount' => $request->amount,
                    'reason' => $request->reason,
                    'status' => 'non payé',
                ]);

                Notification::create([
                    'user_id' => $user->id,
                    'type' => 'penalty',
                    'message' => "Une pénalité de " . ($request->amount) . " FCFA a été ajoutée suite à : \n" . "raison : " . ($request->reason),
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

        // $loans = Loan::whereHas('copy', function ($query) use ($libraryIds) {
        //     $query->whereIn('library_id', $libraryIds);
        // })
            ->with(['user:id,name,email', 'copy.book:id,title'])
            ->orderBy('expected_return_date', 'asc');
            

            $loans = $loansQuery->get();

        return response()->json($loans);
    }
}
