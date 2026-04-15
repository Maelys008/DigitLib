<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Copy;

class ScanController extends Controller
{
    public function handleScan($token)
    {
        // 1. Chercher l'exemplaire
        $copy = Copy::with(['book.library'])
            ->where('codeQR', $token)
            ->first();

        if (! $copy) {
            return response()->json(['message' => 'Ce code ne correspond à aucun livre du catalogue.'], 404);
        }

        // 2. Vérifier l'inscription (Sécurité supplémentaire)
        $user = auth('sanctum')->user();
        $isMember = $user->libraries()->where('libraries.id', $copy->book->library_id)->exists();

        if (! $isMember) {
            return response()->json([
                'message' => 'Accès refusé. Vous devez être membre de la bibliothèque "'.$copy->book->library->name.'"',
            ], 403);
        }

        // 3. Retourner les infos
        return response()->json([
            'status' => 'success',
            'data' => [
                'copy_id' => $copy->id,
                'book_title' => $copy->book->title,
                'author' => $copy->book->author,
                'library' => $copy->book->library->name,
                'status' => $copy->status,
                'is_available' => $copy->status === 'disponible',
                'cover' => $copy->book->cover_image ? asset('storage/'.$copy->book->cover_image) : null,
            ],
        ]);
    }
}
