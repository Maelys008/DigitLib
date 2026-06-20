<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;
use GuzzleHttp\Client;  

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        try {
            // Crée un client Guzzle avec vérification SSL désactivée (TEMPORAIRE)
            $guzzleClient = new Client([
                'verify' => false,  // ⚠️ Uniquement pour le développement !
                'timeout' => 30,
            ]);
            
            // Retourne l'URL de redirection en JSON pour le frontend
            $redirectUrl = Socialite::driver($provider)
                ->stateless()
                ->setHttpClient($guzzleClient)
                ->redirect()
                ->getTargetUrl();
                
            return response()->json(['url' => $redirectUrl]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
public function handleProviderCallback($provider)
{
    try {
        $guzzleClient = new Client([
            'verify' => false,
            'timeout' => 30,
        ]);
        
        $socialUser = Socialite::driver($provider)
            ->stateless()
            ->setHttpClient($guzzleClient)
            ->user();
    } catch (\Exception $e) {
        return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/auth/callback?error=' . urlencode($e->getMessage()));
    }

    $user = DB::transaction(function () use ($socialUser, $provider) {
        // 🔥 Vérifier si l'utilisateur existe déjà
        $existingUser = User::where('email', $socialUser->getEmail())->first();
        
        if ($existingUser) {
            // Si l'utilisateur existe, on le retourne tel quel (avec son statut Super Admin)
            return $existingUser;
        }

        // Sinon, on crée un nouvel utilisateur
        $user = User::create([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'password' => null,
            'status' => 'active',
            'email_verified_at' => now(),
            'is_super_admin' => false, // Par défaut, pas Super Admin
        ]);

        // Sauvegarder le compte social
        if (method_exists($user, 'socialAccounts')) {
            $user->socialAccounts()->create([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'token' => $socialUser->token,
            ]);
        }

        return $user;
    });

    $token = $user->createToken('auth_token')->plainTextToken;
    
    // 🔥 Passer is_super_admin dans l'URL
    $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect($frontendUrl . '/auth/callback?token=' . $token . '&is_super_admin=' . ($user->is_super_admin ? 1 : 0));
}
}