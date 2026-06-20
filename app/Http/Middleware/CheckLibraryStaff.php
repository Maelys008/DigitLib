<?php

namespace App\Http\Middleware;

use App\Models\Library;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLibraryStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        $libraryId = $request->session()->get('active_library_id') 
                    ?? $request->route('library') 
                    ?? $request->library_id;

        if (!$libraryId) {
            return $next($request);
        }

        $library = Library::find($libraryId);
        if (!$library) {
            return response()->json(['message' => 'Bibliothèque introuvable'], 404);
        }

        // Vérifie si l'utilisateur est admin de la bibliothèque
        if ($library->administrator_id == $user->id) {
            return $next($request);
        }

        // Vérifie si l'utilisateur a un rôle dans cette bibliothèque
        $hasRole = $user->roles()
            ->where('role_user.library_id', $library->id)
            ->exists();

        if ($hasRole) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Action réservée à l\'équipe de gestion de la bibliothèque.'
        ], 403);
    }
}