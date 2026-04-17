<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Club;
use App\Models\Club_member;
use App\Models\Message;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    public function index()
    {
        $user = auth('sanctum')->user();

        $clubs = Club::withCount('members')
            ->with('creator:id,name')
            ->get()
            ->map(function ($club) use ($user) {
                // Ajouter le statut d'adhésion pour l'utilisateur connecté
                $club->is_joined = $user
                    ? Club_member::where('user_id', $user->id)
                        ->where('club_id', $club->id)
                        ->exists()
                    : false;

                return $club;
            });

        return response()->json($clubs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:clubs,name|max:255',
            'description' => 'nullable|string',
        ]);

        $club = Club::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
        ]);

        Club_member::create([
            'user_id' => $request->user()->id,
            'club_id' => $club->id,
            'date_joined' => now(),
        ]);

        return response()->json(['message' => 'Club créé !', 'club' => $club], 201);
    }

    public function join(Request $request, $id)
    {
        $user = $request->user();

        $club = Club::findOrFail($id);

        $alreadyMember = Club_member::where('user_id', $user->id)
            ->where('club_id', $id)
            ->exists();

        if ($alreadyMember) {
            return response()->json(['message' => 'Déjà membre.'], 422);
        }

        Club_member::create([
            'user_id' => $user->id,
            'club_id' => $id,
            'date_joined' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Vous avez rejoint le club !']);
    }

    // Envoyer un message
    public function sendMessage(Request $request, $clubId)
    {
        $request->validate(['message' => 'required|string']);

        $member = Club_member::where('user_id', $request->user()->id)
            ->where('club_id', $clubId)
            ->first();

        if (! $member) {
            return response()->json(['message' => 'Vous n\'êtes pas membre de ce club.'], 403);
        }

        $message = Message::create([
            'member_id' => $member->id,
            'club_id' => $clubId,
            'message' => $request->message,
        ]);

        return response()->json(['message' => 'Message envoyé', 'data' => $message], 201);
    }

    // Récupérer les messages d'un club
    public function getMessages(Request $request, $clubId)
    {
        $isMember = Club_member::where('user_id', $request->user()->id)
            ->where('club_id', $clubId)
            ->exists();

        if (! $isMember) {
            return response()->json([
                'message' => 'Accès refusé.',
            ], 403);
        }

        $messages = Message::where('club_id', $clubId)
            ->with('clubMember.user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Quitter un club
    public function leave(Request $request, $id)
    {
        $club = Club::findOrFail($id);

        $member = Club_member::where('user_id', $request->user()->id)
            ->where('club_id', $id)
            ->first();

        if (! $member) {
            return response()->json(['message' => 'Vous n\'êtes pas membre de ce club.'], 404);
        }

        $member->delete();

        return response()->json(['message' => 'Vous avez quitté le club.']);
    }

    public function deleteMessage(Request $request, $messageId)
    {
        $message = Message::with('club')->findOrFail($messageId);
        $user = $request->user();

        $isAuthor = Club_member::where('id', $message->member_id)
            ->where('user_id', $user->id)
            ->exists();

        $isAdmin = ($message->club->user_id === $user->id);

        if (! $isAdmin && ! $isAuthor) {
            return response()->json([
                'message' => 'Action non authorisée.',
            ], 403);
        }
        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    public function show(Request $request, $id)
    {
        $club = Club::with(['creator:id,name']) // ← Charger le créateur
            ->withCount('members') // ← Compter les membres
            ->findOrFail($id);

        // Vérifier si l'utilisateur connecté est membre
        $club->is_joined = false;
        if ($request->user()) {
            $club->is_joined = Club_member::where('user_id', $request->user()->id)
                ->where('club_id', $id)
                ->exists();
        }

        // Ajouter le nombre de membres (déjà fait par withCount)
        // $club->members_count est automatiquement ajouté par withCount

        return response()->json(['club' => $club]);
    }

    public function destroy(Request $request, $id)
    {
        $club = Club::findOrFail($id);

        // Vérification : Seul le créateur peut supprimer
        if ($club->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        // Suppression du club (les relations suivront si onDelete('cascade') est défini)
        $club->delete();

        return response()->json(['message' => 'Club supprimé avec succès']);
    }
}
