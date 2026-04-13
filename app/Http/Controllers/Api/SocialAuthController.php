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
                'verify' => false,  // ⚠️ Temporaire !
                'timeout' => 30,
            ]);
            
            $socialUser = Socialite::driver($provider)
                ->stateless()
                ->setHttpClient($guzzleClient)
                ->user();
        } catch (\Exception $e) {
            // Redirige vers le callback avec l'erreur
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/auth/callback?error=' . urlencode($e->getMessage()));
        }

        $user = DB::transaction(function () use ($socialUser, $provider) {
            $user = User::firstOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name' => $socialUser->getName(),
                    'password' => null,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->email_verified_at) {
                $user->email_verified_at = now();
                $user->save();
            }

            // Vérifie que la relation socialAccounts existe
            if (method_exists($user, 'socialAccounts')) {
                $user->socialAccounts()->firstOrCreate([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ], [
                    'token' => $socialUser->token,
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Redirige vers la page de callback frontend avec le token
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        return redirect($frontendUrl . '/auth/callback?token=' . $token);
    }
}