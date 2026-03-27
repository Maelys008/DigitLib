<?php

namespace App\Http\Middleware;

use App\Models\Library;
use App\Models\Internal_member;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLibraryStaff
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $libraryId = $request->route('library') ?? $request->library_id;

        if (!$libraryId) return $next($request);

        $library = Library::find($libraryId);
        if (!$library) return response()->json(['message' => 'Bibliothèque introuvable'], 404);


        $isAdmin = $this->isUserAdminOf($user->id, $library);


        $isLibrarian = Internal_member::where('user_id', $user->id)
            ->where('library_id', $library->id)
            ->whereHas('role_assignments.role', function ($query) {
                $query->where('name_role', 'Librarian');
            })->exists();
        $isAdministrator = Internal_member::where('user_id', $user->id)
            ->where('library_id', $library->id)
            ->whereHas('role_assignments.role', function ($query) {
                $query->where('name_role', 'Administrator');
            })->exists();
       

        if ($isAdmin || $isLibrarian || $isAdministrator) {
            return $next($request);
        }

        return response()->json(['message' => 'Action réservée à l\'équipe de gestion de la bibliothèque.'], 403);
    }

    /**
     * Check if user is admin of the library.
     */
    private function isUserAdminOf($userId, $library): bool
    {
        if ($library->administrator_id === $userId) {
            return true;
        }

        if ($library->parent) {
            return $this->isUserAdminOf($userId, $library->parent);
        }

        return false;
    }

    // private function isUserAdminOf($userId, $library)
    // {
    //     if (!$library) return false;

    //     if ($library->administrator_id == $userId) return true;

    //     return $this->isUserAdminOf($userId, $library->parent);
    // }
}
