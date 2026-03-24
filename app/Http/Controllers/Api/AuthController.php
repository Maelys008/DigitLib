<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;


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

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Veuillez vérifier votre email avant de vous connecter.'
            ], 403);
        }

        $user->update([
            'status' => 'active',
        ]);
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
        $otp = rand(100000, 999999);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'inactive',
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        // $token = $user->createToken('auth_token')->plainTextToken;

       Mail::to($user->email)->send(new SendOtpMail($otp, $user->email));

        return response()->json([
            'message' => 'Code envoyé par email'
        ], 201);
    }
    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        $user = User::where('email', $request->email)->first();

        if (!$user) return response()->json(['message' => 'Utilisateur introuvable'], 404);
        if ($user->email_verified_at) return response()->json(['message' => 'Email déjà vérifié'], 422);

        $otp = rand(100000, 999999);
        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($user->email)->send(new SendOtpMail($otp));

        return response()->json(['message' => 'Un nouveau code a été envoyé.']);
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

    public function logout(Request $request)
    {
        /** @var \Laravel\Sanctum\PersonalAccessToken $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->update([
            'status' => 'desactive',
        ]);

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ], 200);
    }
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'Code incorrect'], 422);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Code expiré'], 422);
        }

        // ✅ Activation
        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Compte vérifié',
            'token' => $token,
            'user' => $user
        ]);
    }
}
