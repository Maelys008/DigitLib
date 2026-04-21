<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class RecordController extends Controller
{
    /**
     * Récupérer tous les signalements du casier bibliothécaire
     */
    public function getLibraryRecords(Request $request)
    {
        $authUser = $request->user();

        // UNIQUEMENT LES SIGNALEMENTS GRAVES NON RÉSOLUS
        $records = Incident::where('is_library_record', 1)
            ->where('status', '!=', 'resolved')  // ← EXCLURE LES RÉSOLUS
            ->with(['user', 'library'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'records' => $records,
            'total' => $records->count(),
        ]);
    }

    /**
     * Créer un signalement dans le casier bibliothécaire
     */
    public function createLibraryRecord(Request $request)
    {
        Log::info('=== createLibraryRecord appelée ===');
        Log::info('related_incident_id reçu: '.$request->related_incident_id);

        $authUser = $request->user();

        // Vérifier que l'utilisateur est bibliothécaire
        $isLibrarian = Internal_member::where('user_id', $authUser->id)->exists();

        if (! $isLibrarian && $authUser->role !== 'admin') {
            return response()->json(['message' => 'Seuls les bibliothécaires peuvent signaler des incidents'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:info,warning,critical,emergency',
            'related_incident_id' => 'required|exists:incidents,id',  // ← required
            'user_id' => 'nullable|exists:users,id',
            'library_id' => 'nullable|exists:libraries,id',
        ]);

        // 🔥 RÉCUPÉRER L'INCIDENT EXISTANT
        $existingIncident = Incident::findOrFail($request->related_incident_id);

        Log::info('Incident trouvé - is_library_record AVANT: '.$existingIncident->is_library_record);

        // Vérifier si déjà signalé au casier
        if ($existingIncident->is_library_record) {
            return response()->json(['message' => 'Cet incident a déjà été signalé au casier'], 422);
        }

        // 🔥 METTRE À JOUR L'INCIDENT EXISTANT (pas en créer un nouveau)
        $existingIncident->update([
            'title' => $request->title,
            'severity' => $request->severity,
            'is_library_record' => 1,
            'notify_all_librarians' => 1,
        ]);
        $existingIncident->refresh();

        Log::info('Incident mis à jour - is_library_record APRÈS: '.$existingIncident->is_library_record);

        Log::info('Incident mis à jour - ID: '.$existingIncident->id.', is_library_record: '.$existingIncident->is_library_record);

        // Notifications pour le reader concerné
        if ($request->user_id) {
            $concernedUser = User::find($request->user_id);
            if ($concernedUser) {
                Notification::create([
                    'user_id' => $concernedUser->id,
                    'type' => 'incident_reported',
                    'message' => "Un incident grave vous concernant a été signalé par {$authUser->name}.",
                    'object_type' => 'incident',
                    'object' => $existingIncident->id,
                    'date_sent' => now(),
                ]);
            }
        }

        // Notifier tous les bibliothécaires
        $librarianIds = Internal_member::distinct()->pluck('user_id');
        $adminIds = User::where('role', 'admin')->pluck('id');
        $allLibrarianIds = $librarianIds->merge($adminIds)->unique();

        foreach ($allLibrarianIds as $librarianId) {
            if ($librarianId == $authUser->id) {
                continue;
            }

            Notification::create([
                'user_id' => $librarianId,
                'type' => 'library_record',
                'message' => "⚠️ NOUVEAU SIGNALEMENT - {$existingIncident->title}",
                'object_type' => 'incident',
                'object' => $existingIncident->id,
                'date_sent' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Incident signalé à tous les bibliothécaires',
            'record' => $existingIncident->load(['user', 'library']),
        ], 201);
    }

    /**
     * Récupérer un signalement spécifique du casier
     */
    public function getLibraryRecordDetail($id)
    {
        $record = Incident::with(['user', 'library'])
            ->findOrFail($id);

        return response()->json($record);
    }

    /**
     * Marquer un signalement comme résolu
     */
    public function resolveLibraryRecord(Request $request, $id)
    {
        $authUser = $request->user();

        $record = Incident::findOrFail($id);

        // Vérifier que l'utilisateur peut résoudre
        $isLibrarian = Internal_member::where('user_id', $authUser->id)->exists();

        if (! $isLibrarian && $authUser->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $record->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'resolved_by' => $authUser->id,
        ]);

        // Notifier le créateur du signalement qu'il est résolu
        if ($record->created_by) {
            $creator = User::find($record->created_by);
            if ($creator) {
                Notification::create([
                    'user_id' => $creator->id,
                    'type' => 'record_resolved',
                    'message' => "Le signalement '{$record->title}' a été marqué comme résolu par {$authUser->name}.",
                    'object_type' => 'incident',
                    'object' => $record->id,
                    'date_sent' => now(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Signalement marqué comme résolu',
            'record' => $record,
        ]);
    }

    /**
     * Récupérer le casier d'un utilisateur (existant)
     */
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
                'message' => 'Accès refusé.',
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
