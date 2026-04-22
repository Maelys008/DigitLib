<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class ProfilController extends Controller
{
    /**
     * Retrieve information from the connected profile
     */
    public function show(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }
            
            $user->load('badge');
            
            return response()->json([
                'user' => $user,
                'stats' => [
                    'total_loans' => $user->loans()->count(),
                    'active_loans' => $user->loans()->whereNull('actual_return_date')->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur ProfilController@show: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Update basic information
     */
    public function update(Request $request)
    {
        try {
            $user = $request->user();

            $data = $request->validate([
                'name' => 'sometimes|string|max:255',
                'tel' => 'sometimes|string|unique:users,tel,' . $user->id,
            ]);

            $user->update($data);

            return response()->json(['message' => 'Profil mis à jour', 'user' => $user]);
        } catch (\Exception $e) {
            Log::error('Erreur ProfilController@update: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Change password
     */
    public function updatePassword(Request $request)
    {
        try {
            $request->validate([
                'current_password' => 'required|current_password',
                'password' => ['required', 'confirmed', Password::defaults()],
            ]);

            $request->user()->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json(['message' => 'Mot de passe modifié avec succès']);
        } catch (\Exception $e) {
            Log::error('Erreur ProfilController@updatePassword: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }

    /**
     * Get user status (badge, points, etc.)
     */
    public function status(Request $request)
    {
        try {
            $user = $request->user()->load('badge');
            
            $nextBadge = Badge::where('condition_of_obtaining', '>', $user->score)
                ->orderBy('condition_of_obtaining', 'asc')
                ->first();

            return response()->json([
                'user' => $user,
                'stats' => [
                    'current_loans' => $user->loans()->whereNull('actual_return_date')->count(),
                    'max_books_allowed' => $user->badge->maximum_book ?? 2,
                    'points_to_next_level' => $nextBadge ? ($nextBadge->condition_of_obtaining - $user->score) : 0,
                    'next_badge_name' => $nextBadge->name ?? 'Niveau Max atteint',
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur ProfilController@status: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur serveur'], 500);
        }
    }
}