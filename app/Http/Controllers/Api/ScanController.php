<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Copy;
use App\Models\Book;

class ScanController extends Controller
{
    public function handleScan($token)
    {
        // 1. Chercher l'exemplaire
        $copy = Copy::with(['book.library'])
            ->where('codeQR', $token)
            ->first();

        if (! $copy) {
            return response()->json([
                'success' => false,
                'message' => 'Ce code QR ne correspond à aucun livre.'
            ], 404);
        }

        $book = $copy->book;
        $user = auth('sanctum')->user();
        
        // Vérifier si l'utilisateur est membre de la bibliothèque
        $isMember = false;
        if ($user) {
            $isMember = $user->inscriptions()
                ->where('library_id', $book->library_id)
                ->exists();
        }

        // Retourner les informations complètes du livre
        return response()->json([
            'success' => true,
            'book' => [
                'id' => $book->id,
                'title' => $book->title,
                'author' => $book->author,
                'description' => $book->description,
                'cover_image' => $book->cover_image,
                'nb_available' => $book->nb_available,
                'nb_copy' => $book->nb_copy,
                'library_name' => $book->library->name ?? 'Bibliothèque',
                'library_id' => $book->library_id,
                'genre' => $book->genre->name ?? null,
                'year_of_publication' => $book->year_of_publication,
                'isbn' => $book->isbn,
            ],
            'copy' => [
                'id' => $copy->id,
                'status' => $copy->status,
                'condition' => $copy->condition,
            ],
            'is_member' => $isMember,
            'can_borrow' => ($copy->status === 'disponible' && $isMember),
        ]);
    }
}