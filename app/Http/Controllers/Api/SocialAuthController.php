<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\DB;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        //return Socialite::driver($provider)->stateless()->redirect();
        return Socialite::driver($provider)->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            //$socialUser = Socialite::driver($provider)->stateless()->user();
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Authentification échouée'], 401);
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

            if (!$user->email_verified_at) {
                $user->email_verified_at = now();
                $user->save();
            }

            
            $user->socialAccounts()->firstOrCreate([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
            ], [
                'token' => $socialUser->token,
            ]);

            return $user;
        });

        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'requires_profile_completion' => $user->tel === null 
        ]);
    }
}
