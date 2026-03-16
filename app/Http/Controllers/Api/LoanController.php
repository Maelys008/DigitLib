<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Copy;
use App\Models\Loan;
use App\Models\Penality;
use App\Models\Reservation;
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

        if ($user->role == 'admin') {
            return Loan::with(['user', 'copy.book'])->get();
        }

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


            $loan->update(['actual_return_date' => $now]);


            $loan->copy->update(['status' => 'disponible']);
            $loan->copy->book->increment('nb_available');


            $isLate = $now->greaterThan($loan->expected_return_date);
            if ($isLate) {
                $user->decrement('score');
            } else {
                $user->increment('score');
            }
            


            $penalty = null;
            if ($isLate || $request->has('amount')) {
                $penalty = Penality::create([
                    'user_id' => $user->id,
                    'loan_id' => $loan->id,
                    'amount' => $request->amount ?? 500,
                    'reason' => $request->reason ?? "Retour tardif",
                    'status' => 'non payé',
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
}
