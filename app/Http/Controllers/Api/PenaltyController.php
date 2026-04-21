<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Models\Penalty;
use App\Models\Internal_member;  
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PenaltyController extends Controller
{
   // Récupérer les pénalités d'une bibliothèque spécifique
public function index(Request $request, $libraryId = null)
{
    $user = $request->user();
    
    // Si un libraryId est fourni, on vérifie les permissions
    if ($libraryId) {
        $library = Library::findOrFail($libraryId);
        
        $isAdmin = $library->administrator_id === $user->id;
        $isStaff = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();
        
        // Seul l'admin peut voir les pénalités (pas les membres internes)
        if (!$isAdmin) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        $penalties = Penalty::with(['user', 'loan.copy.book'])
            ->whereHas('loan.copy.book', function($query) use ($libraryId) {
                $query->where('library_id', $libraryId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($penalties);
    }
    
    // Sinon, on récupère la bibliothèque de l'utilisateur (admin)
    $library = Library::where('administrator_id', $user->id)->first();
    
    if (!$library) {
        return response()->json([]);
    }
    
    $penalties = Penalty::with(['user', 'loan.copy.book'])
        ->whereHas('loan.copy.book', function($query) use ($library) {
            $query->where('library_id', $library->id);
        })
        ->orderBy('created_at', 'desc')
        ->get();
    
    return response()->json($penalties);
}

    // Nouvelle méthode pour récupérer les pénalités d'une bibliothèque spécifique par ID
    public function getLibraryPenalties($libraryId, Request $request)
    {
        $user = $request->user();
        $library = Library::findOrFail($libraryId);
        
        // Vérifier que l'utilisateur est l'administrateur de cette bibliothèque
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        $penalties = Penalty::with(['user', 'loan.copy.book'])
            ->whereHas('loan.copy.book', function($query) use ($libraryId) {
                $query->where('library_id', $libraryId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($penalties);
    }

    public function payPenalty($penaltyId, Request $request)
    {
        $user = $request->user();
        $penalty = Penalty::findOrFail($penaltyId);
        
        // Vérifier que l'utilisateur est admin de la bibliothèque
        $library = $penalty->loan->copy->book->library;
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
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

    // Compter les pénalités non payées pour une bibliothèque
    public function getUnpaidPenaltiesCount($libraryId, Request $request)
    {
        $library = Library::findOrFail($libraryId);
        $user = $request->user();
        
        // Vérifier que l'utilisateur est admin
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