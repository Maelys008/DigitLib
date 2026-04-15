<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Models\Penalty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenaltyController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $penalties = Penalty::with(['user', 'loan.copy.book'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($penalties);
    }

    public function payPenalty($penaltyId)
{
    $penalty = Penalty::findOrFail($penaltyId);
    
    DB::transaction(function () use ($penalty) {
        $penalty->update(['status' => 'payé']);
        
        // Si c'est une pénalité pour perte, clôturer l'emprunt
        $loan = $penalty->loan;
        if ($loan && !$loan->actual_return_date) {
            $loan->update([
                'actual_return_date' => now(),
                'status' => 'lost_settled' 
            ]);
        }
    });
    
    return response()->json(['message' => 'Pénalité réglée avec succès.']);
}

    // Nouvelle méthode pour compter les pénalités non payées
    public function getUnpaidPenaltiesCount($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        
        // Vérifier que l'utilisateur est admin
        $user = auth("sanctum")->user();
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        // Compter les pénalités non payées pour cette bibliothèque
        $count = Penalty::whereHas('loan.copy.book', function($query) use ($libraryId) {
            $query->where('library_id', $libraryId);
        })
        ->where('status', 'non payé')
        ->count();
        
        return response()->json(['count' => $count]);
    }
}