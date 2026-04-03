<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfilController extends Controller
{
    /**
     * Retrieve information from the connected profile
    */
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load(['badge', 'score', 'inscriptions.library']),
            'stats' => [
                'total_loans' => $request->user()->loans()->count(),
                'active_loans' => $request->user()->loans()->whereNull('actual_return_date')->count(),
            ]
        ]);
    }

    /**
     * Update basic information
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'tel' => 'sometimes|string|unique:users,tel,' . $user->id,
        ]);

        $user->update($data);

        return response()->json(['message' => 'Profil mis à jour', 'user' => $user]);
    }

    /**
     * Change password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    }

    public function status(Request $request)
    {
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
    }
}

