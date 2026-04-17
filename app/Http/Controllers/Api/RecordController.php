<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\User;
use Illuminate\Http\Request;

class RecordController extends Controller
{
    public function getLibraryRecord(Request $request, ?User $user = null)
    {
        $authUser = $request->user();

        // Cas 1 : L'utilisateur veut voir son propre casier
        if (! $user || $user->id === $authUser->id) {
            return $this->buildRecordResponse($authUser);
        }

        // Cas 2 : Un membre interne veut voir le casier d'un autre membre
        $staffLibraries = Internal_member::where('user_id', $authUser->id)->pluck('library_id');

        // On vérifie si l'utilisateur cible est inscrit dans au moins une de ces bibliothèques
        $isMember = Inscription::where('user_id', $user->id)
            ->whereIn('library_id', $staffLibraries)
            ->exists();

        if (! $isMember) {
            return response()->json([
                'message' => "Accès refusé.",
            ], 403);
        }

        return $this->buildRecordResponse($user);
    }

    /**
     * Centralise la construction de la réponse pour éviter la répétition
     */
    private function buildRecordResponse(User $targetUser)
    {
        $targetUser->load(['badge', 'penalties', 'incidents.library']);

        return response()->json([
            'user_info' => [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'current_score' => $targetUser->score,
                'rang' => $targetUser->badge->name ?? 'Lecteur Standard',
                'status' => $targetUser->status,
            ],
            'stats' => [
                'total_incidents' => $targetUser->incidents->count(),
                'unpaid_penalties_sum' => (int) $targetUser->penalties()->where('status', 'non payé')->sum('amount'),
                'total_loans' => $targetUser->loans()->count(),
            ],
            'incident_history' => $targetUser->incidents()->with('library:id,name')->latest()->take(10)->get(),
            'active_penalties' => $targetUser->penalties()->where('status', 'non payé')->get(),
        ]);
    }
}
