<?php

namespace App\Http\Middleware;

use App\Models\Internal_member;
use App\Models\Library;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLibraryStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Récupère l'ID de la bibliothèque depuis la session ou la route
        $libraryId = $request->session()->get('active_library_id') ?? $request->route('library') ?? $request->library_id;

        if (!$libraryId) {
            return $next($request);
        }

        $library = Library::find($libraryId);
        if (!$library) {
            return response()->json(['message' => 'Bibliothèque introuvable'], 404);
        }

        // Vérifie si l'utilisateur est admin de la bibliothèque
        $isAdmin = $this->isUserAdminOf($user->id, $library);

        // Vérifie si l'utilisateur est membre interne (staff)
        $isStaff = Internal_member::where('user_id', $user->id)
            ->where('library_id', $library->id)
            ->exists();

        if ($isAdmin || $isStaff) {
            return $next($request);
        }

        return response()->json(['message' => 'Action réservée à l\'équipe de gestion de la bibliothèque.'], 403);
    }

    private function isUserAdminOf($userId, $library)
    {
        if (!$library) return false;

        if ($library->administrator_id == $userId) return true;

        return $this->isUserAdminOf($userId, $library->parent);
    }
}