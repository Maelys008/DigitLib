<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penalty;
use App\Models\Library;
use Illuminate\Http\Request;

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
        
        $penalty->update([
            'status' => 'payé',
        ]);
        
        return response()->json(['message' => 'Pénalité réglée avec succès.']);
    }

    // Nouvelle méthode pour compter les pénalités non payées
    public function getUnpaidPenaltiesCount($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        
        // Vérifier que l'utilisateur est admin
        $user = auth()->user();
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