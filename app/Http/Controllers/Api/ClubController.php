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
        return response()->json(Club::with('creactor')->get());
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

        return response()->json(['message' => 'Vous avez rejoint le club !']);
    }

    // Envoyer un message
    public function sendMessage(Request $request, $clubId)
    {
        $request->validate(['message' => 'required|string']);

        $member = Club_member::where('user_id', $request->user()->id)
            ->where('club_id', $clubId)
            ->first();

        if (!$member) {
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
    public function getMessages($clubId)
    {
        $messages = Message::where('club_id', $clubId)
            ->with('club_member.user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }

    // Quitter un club
    public function leave(Request $request, $id)
    {
        $member = Club_member::where('user_id', $request->user()->id)
            ->where('club_id', $id)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Vous n\'êtes pas membre de ce club.'], 404);
        }


        $member->delete();

        return response()->json(['message' => 'Vous avez quitté le club.']);
    }

    public function deleteMessage(Request $request, $messageId)
    {
        $message = Message::findOrFail($messageId);

        $member = Club_member::where('id', $message->member_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$member) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }
}
