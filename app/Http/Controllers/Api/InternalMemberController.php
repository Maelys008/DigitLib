<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\Role_assignment;
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

        return DB::transaction(function () use ($userToAdd, $request) {

            $member = Internal_member::firstOrCreate([
                'user_id' => $userToAdd->id,
                'library_id' => $request->library_id,
            ], []);

            $roleExists = Role_assignment::where('internal_member_id', $member->id)
                ->where('role_id', $request->role_id)
                ->exists();

            if ($roleExists) {
                return response()->json(['message' => 'Cet utilisateur possède déjà ce rôle.'], 422);
            }

            Role_assignment::create([
                'internal_member_id' => $member->id,
                'role_id' => $request->role_id,
                'date_assignment' => now(),
            ]);

            return response()->json([
                'message' => 'Rôle attribué avec succès.',
                'member' => $member->load(['user', 'role_assignments.role']),
            ], 201);
        });
    }

    public function index($libraryId)
    {
        $user = auth('sanctum')->user();
        $library = Library::findOrFail($libraryId);
        
        // 🔥 Seul l'admin (propriétaire) peut voir les membres internes
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        return Internal_member::with(['user', 'role_assignments.role'])
            ->where('library_id', $libraryId)
            ->get();
    }
}