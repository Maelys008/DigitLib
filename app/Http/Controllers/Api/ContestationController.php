<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contestation;
use App\Models\Incident;
use App\Models\Internal_member;
use App\Models\Notification;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContestationController extends Controller
{
    /**
     * Lister les contestations de l'utilisateur connecté
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $contestations = Contestation::with(['incident.library', 'incident.loan.copy.book'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($contestations);
    }

    /**
     * Créer une contestation pour un incident
     */
    /**
     * Créer une contestation pour un incident
     */
    public function store(Request $request)
    {
        \Log::info('=== Contestation store appelée ===');
        \Log::info('incident_id: '.$request->incident_id);
        \Log::info('user_id: '.$request->user()->id);

        $request->validate([
            'incident_id' => 'required|exists:incidents,id',
            'message' => 'required|string|min:10|max:1000',
            'justification' => 'nullable|string|max:2000',
        ]);

        $user = $request->user();
        $incident = Incident::with('library')->findOrFail($request->incident_id);

        \Log::info('Incident user_id: '.$incident->user_id);
        \Log::info('Current user_id: '.$user->id);
        \Log::info('Incident status: '.$incident->status);

        // Vérifier que l'incident appartient bien à l'utilisateur
        if ($incident->user_id !== $user->id) {
            \Log::error('Incident n\'appartient pas à l\'utilisateur');

            return response()->json([
                'message' => 'Vous ne pouvez contester que vos propres incidents.',
            ], 403);
        }

        // Vérifier si une contestation existe déjà pour cet incident
        $existingContestation = Contestation::where('user_id', $user->id)
            ->where('incident_id', $request->incident_id)
            ->first();

        if ($existingContestation) {
            return response()->json([
                'message' => 'Vous avez déjà contesté cet incident.',
                'contestation' => $existingContestation,
            ], 422);
        }

        // Vérifier si l'incident peut être contesté (pas déjà résolu)
        if (in_array($incident->status, ['résolue', 'rejetée'])) {
            return response()->json([
                'message' => 'Cet incident ne peut plus être contesté car il est déjà clôturé.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $user, $incident) {
            $contestation = Contestation::create([
                'user_id' => $user->id,
                'incident_id' => $request->incident_id,
                'message' => $request->message,
                'justification' => $request->justification,
                'status' => 'en attente',
            ]);

            // Marquer l'incident comme "en contestation"
            $incident->update(['status' => 'en_attente']);

            // Notifier les bibliothécaires de la bibliothèque concernée
            $libraryId = $incident->library_id;

            if ($libraryId) {
                $librarianIds = Internal_member::where('library_id', $libraryId)
                    ->pluck('user_id');

                foreach ($librarianIds as $librarianId) {
                    Notification::create([
                        'user_id' => $librarianId,
                        'type' => 'contestation_created',
                        'message' => "Nouvelle contestation de {$user->name} concernant un incident.",
                        'object_type' => 'contestation',
                        'object_id' => $contestation->id,
                        'date_sent' => now(),
                    ]);
                }
            }

            // Notification à l'utilisateur
            Notification::create([
                'user_id' => $user->id,
                'type' => 'contestation_submitted',
                'message' => 'Votre contestation a été enregistrée et sera traitée par un bibliothécaire.',
                'object_type' => 'contestation',
                'object_id' => $contestation->id,
                'date_sent' => now(),
            ]);

            return response()->json([
                'message' => 'Contestation enregistrée avec succès.',
                'contestation' => $contestation->load('incident'),
            ], 201);
        });
    }

    /**
     * Voir une contestation spécifique
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();

            $contestation = Contestation::with([
                'incident',
                'incident.library',
                'incident.loan',
                'incident.loan.copy',
                'incident.loan.copy.book',
                'incident.creator',
                'incident.resolver',
            ])->findOrFail($id);

            // Vérifier les permissions
            $isOwner = $contestation->user_id === $user->id;
            $isLibrarian = false;

            if (! $isOwner && $contestation->incident) {
                $libraryId = $contestation->incident->library_id;
                if ($libraryId) {
                    $isLibrarian = Internal_member::where('user_id', $user->id)
                        ->where('library_id', $libraryId)
                        ->exists();
                }
            }

            if (! $isOwner && ! $isLibrarian && ! $user->managedLibraries()->exists() && ! $user->roles()->exists()) {
                return response()->json(['message' => 'Accès non autorisé'], 403);
            }

            return response()->json($contestation);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Contestation non trouvée'], 404);
        } catch (\Exception $e) {
            \Log::error('Erreur dans ContestationController@show: '.$e->getMessage());

            return response()->json(['message' => 'Erreur interne du serveur'], 500);
        }
    }

    /**
     * Traiter une contestation (Bibliothécaire/Admin uniquement)
     */
    public function process(Request $request, $id)
    {
        $request->validate([
            'decision' => 'required|in:accepted,rejected',
            'response_message' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $contestation = Contestation::with('incident')->findOrFail($id);

        // Vérifier que l'utilisateur est bibliothécaire de la bibliothèque concernée
        $libraryId = $contestation->incident->library_id;
        $isLibrarian = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();

        if (! $isLibrarian && ! $user->managedLibraries()->exists() && ! $user->roles()->exists()) {
            return response()->json(['message' => 'Action réservée au personnel de la bibliothèque'], 403);
        }

        // Vérifier que la contestation est en attente
        if ($contestation->status !== 'en attente') {
            return response()->json([
                'message' => 'Cette contestation a déjà été traitée.',
            ], 422);
        }

        return DB::transaction(function () use ($request, $contestation, $user) {
            $newStatus = $request->decision === 'accepted' ? 'acceptée' : 'rejetée';

            $contestation->update([
                'status' => $newStatus,
            ]);

            $incident = $contestation->incident;

            if ($request->decision === 'accepted') {
                // Accepter = annuler l'incident
                $incident->update([
                    'status' => 'rejetée',
                    'resolved_by' => $user->id,
                    'resolved_at' => now(),
                ]);

                // Si l'incident est lié à une pénalité, on pourrait l'annuler ici
                // (à implémenter selon votre logique métier)
            } else {
                // Rejeter = confirmer l'incident
                $incident->update(['status' => 'résolue']);
            }

            // Notification à l'utilisateur
            $decisionText = $request->decision === 'accepted' ? 'acceptée' : 'rejetée';
            $message = "Votre contestation a été {$decisionText}.";

            if ($request->response_message) {
                $message .= ' Message du bibliothécaire : '.$request->response_message;
            }

            Notification::create([
                'user_id' => $contestation->user_id,
                'type' => 'contestation_'.$request->decision,
                'message' => $message,
                'object_type' => 'contestation',
                'object_id' => $contestation->id,
                'date_sent' => now(),
            ]);

            return response()->json([
                'message' => "Contestation {$decisionText} avec succès.",
                'contestation' => $contestation->fresh(),
            ]);
        });
    }

    /**
     * Lister toutes les contestations pour les bibliothécaires
     */
    public function libraryContestations(Request $request)
    {
        $user = $request->user();

        // Récupérer les bibliothèques où l'utilisateur est membre interne
        $libraryIds = Internal_member::where('user_id', $user->id)
            ->pluck('library_id');

        if ($libraryIds->isEmpty() && ! $user->managedLibraries()->exists() && ! $user->roles()->exists()) {
            return response()->json(['message' => 'Accès réservé au personnel'], 403);
        }

        $query = Contestation::with(['user:id,name,email', 'incident.library'])
            ->whereHas('incident', function ($q) use ($libraryIds, $user) {
                if (! $user->managedLibraries()->exists()) {
                    $q->whereIn('library_id', $libraryIds);
                }
            })
            ->orderBy('created_at', 'desc');

        // Filtrer par statut si demandé
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $contestations = $query->paginate($request->input('per_page', 20));

        return response()->json($contestations);
    }

    /**
     * Statistiques des contestations pour le dashboard
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $libraryIds = Internal_member::where('user_id', $user->id)
            ->pluck('library_id');

        if ($libraryIds->isEmpty() && ! $user->managedLibraries()->exists() && ! $user->roles()->exists()) {
            return response()->json(['message' => 'Accès réservé au personnel'], 403);
        }

        $query = Contestation::whereHas('incident', function ($q) use ($libraryIds, $user) {
            if (! $user->managedLibraries()->exists()) {
                $q->whereIn('library_id', $libraryIds);
            }
        });

        $stats = [
            'total' => $query->count(),
            'en_attente' => (clone $query)->where('status', 'en attente')->count(),
            'acceptees' => (clone $query)->where('status', 'acceptée')->count(),
            'rejetees' => (clone $query)->where('status', 'rejetée')->count(),
            'ce_mois' => (clone $query)->whereMonth('created_at', now()->month)->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Ajouter un commentaire à une contestation (optionnel)
     */
    public function addComment(Request $request, $id)
    {
        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $user = $request->user();
        $contestation = Contestation::findOrFail($id);

        // Vérifier les permissions
        $libraryId = $contestation->incident->library_id;
        $isLibrarian = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();

        $isOwner = $contestation->user_id === $user->id;

        if (! $isOwner && ! $isLibrarian && ! $user->managedLibraries()->exists() && ! $user->roles()->exists()) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        // Ajouter le commentaire (nécessite d'ajouter un champ comments en JSON ou table séparée)
        // Version simple : on ajoute au message existant
        $contestation->update([
            'justification' => $contestation->justification."\n\n--- Commentaire de ".
                ($isLibrarian ? 'Bibliothécaire' : 'Utilisateur').
                ' ('.now()->format('d/m/Y H:i').") ---\n".$request->comment,
        ]);

        return response()->json([
            'message' => 'Commentaire ajouté',
            'contestation' => $contestation,
        ]);
    }
}
