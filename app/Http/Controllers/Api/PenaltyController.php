<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Models\Penalty;
use App\Models\Internal_member;  
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class PenaltyController extends Controller
{
    /**
     * Récupérer les pénalités de l'utilisateur connecté (pour le lecteur)
     */
    public function getUserPenalties(Request $request)
    {
        $user = $request->user();
        
        $penalties = Penalty::with(['loan.copy.book', 'loan.copy.book.library'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($penalties);
    }
    
    /**
     * Récupérer les pénalités d'une bibliothèque (pour admin)
     */
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
            
            // Seul l'admin peut voir les pénalités de la bibliothèque
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
        
        // 🔥 NOUVEAU : Si aucun libraryId, retourner les pénalités de l'utilisateur
        $penalties = Penalty::with(['loan.copy.book', 'loan.copy.book.library'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($penalties);
    }
    
    /**
     * Nouvelle méthode pour récupérer les pénalités d'une bibliothèque spécifique par ID (admin)
     */
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
    
    /**
     * 🔥 NOUVEAU : Méthode pour que le lecteur voie ses pénalités non payées
     */
    public function getMyUnpaidPenalties(Request $request)
    {
        $user = $request->user();
        
        $penalties = Penalty::with(['loan.copy.book', 'loan.copy.book.library'])
            ->where('user_id', $user->id)
            ->where('status', 'non_payé')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($penalties);
    }

   public function payPenalty($penaltyId, Request $request)
{
    $user = $request->user();
    $penalty = Penalty::findOrFail($penaltyId);
    
    if ($penalty->user_id !== $user->id) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }
    
    if ($penalty->status === 'payé') {
        return response()->json(['message' => 'Déjà payé'], 422);
    }
    
    $penalty->update(['status' => 'payé']);
    
    // Notifier le bibliothécaire
    if ($penalty->loan && $penalty->loan->copy && $penalty->loan->copy->book && $penalty->loan->copy->book->library) {
        $librarianId = $penalty->loan->copy->book->library->administrator_id;
        Notification::create([
            'user_id' => $librarianId,
            'type' => 'penalty_paid_notification',
            'message' => "💰 L'utilisateur {$user->name} a payé {$penalty->amount} FCFA pour la pénalité : {$penalty->reason}",
            'object_type' => 'penalty',
            'object_id' => $penalty->id,
            'date_sent' => now(),
        ]);
    }
    
    return response()->json(['success' => true]);
}

    // Compter les pénalités non payées pour une bibliothèque (admin)
    public function getUnpaidPenaltiesCount($libraryId, Request $request)
    {
        $library = Library::findOrFail($libraryId);
        $user = $request->user();
        
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        $count = Penalty::whereHas('loan.copy.book', function($query) use ($libraryId) {
            $query->where('library_id', $libraryId);
        })
        ->where('status', 'non_payé')
        ->count();
        
        return response()->json(['count' => $count]);
    }
}