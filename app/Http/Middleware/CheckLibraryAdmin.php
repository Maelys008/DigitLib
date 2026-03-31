<?php

namespace App\Http\Middleware;

use App\Models\Library;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLibraryAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $libraryId = $request->route('library') ?? $request->library_id;

        if (! $libraryId) {
            return $next($request);
        }

        $library = Library::find($libraryId);

        if ($this->isUserAdminOf($user->id, $library)) {
            return $next($request);
        }

        return response()->json(['message' => 'Accès refusé : Vous n\'êtes pas l\'administrateur.'], 403);
    }

    private function isUserAdminOf($userId, $library)
    {
        if (! $library) {
            return false;
        }

        if ($library->administrator_id == $userId) {
            return true;
        }

        return $this->isUserAdminOf($userId, $library->parent);
    }
}
