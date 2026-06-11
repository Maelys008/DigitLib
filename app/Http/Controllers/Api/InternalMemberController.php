<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InternalMemberController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'library_id' => 'required|exists:libraries,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $userToAdd = User::where('email', $request->email)->first();
        // $library = Library::findOrFail($request->library_id);

        return DB::transaction(function () use ($userToAdd, $request) {
            // Ajouter comme membre interne
            $member = Internal_member::firstOrCreate([
                'user_id' => $userToAdd->id,
                'library_id' => $request->library_id,
            ]);

            // Assigner le rôle via la table role_user
            $userToAdd->assignRoleToLibrary($request->role_id, $request->library_id);

            return response()->json([
                'message' => 'Rôle attribué avec succès.',
                'member' => $member->load('user'),
            ], 201);
        });
    }

    public function index($libraryId)
    {
        $user = auth('sanctum')->user();
        $library = Library::findOrFail($libraryId);

        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $members = Internal_member::with(['user'])
            ->where('library_id', $libraryId)
            ->get()
            ->map(function ($member) use ($libraryId) {
                return [
                    'id' => $member->id,
                    'user_id' => $member->user_id,
                    'user' => $member->user,
                    'roles' => $member->user->roles()
                        ->where('role_user.library_id', $libraryId)
                        ->get(),
                ];
            });

        return response()->json($members);
    }

    public function destroy($memberId)
    {
        $member = Internal_member::findOrFail($memberId);
        $user = auth('sanctum')->user();

        $library = Library::findOrFail($member->library_id);
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Supprimer les rôles de l'utilisateur dans cette bibliothèque
        $member->user->roles()
            ->where('role_user.library_id', $member->library_id)
            ->detach();

        $member->delete();

        return response()->json(['message' => 'Membre retiré avec succès']);
    }
}
