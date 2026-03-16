<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',

        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }


    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'inactive',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Étape 1 réussie : Compte créé.',
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }


    public function completeProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'tel' => 'required|string|unique:users,tel',
        ]);

        $user = $request->user(); 

        $user->update([
            'name' => $request->name,
            'tel' => $request->tel,
            'identity_hash' => $request->identity_hash,
            'status' => 'active', 
        ]);

        return response()->json([
            'message' => 'Profil complété avec succès.',
            'user' => $user
        ]);
    }
}
