<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Copy;

class ScanController extends Controller
{
    public function handleScan($token)
    {
        $copy = Copy::with(['book.library', 'book.genre', 'copyState'])
            ->where('codeQR', $token)
            ->first();

        if (! $copy) {
            return response()->json(['success' => false, 'message' => 'Ce code QR ne correspond à aucun livre.'], 404);
        }

        $book = $copy->book;

        return response()->json([
            'success' => true,
            'book'    => [
                'id'                  => $book->id,
                'title'               => $book->title,
                'author'              => $book->author,
                'description'         => $book->description,
                'cover_image'         => $book->cover_image,
                'nb_available'        => $book->nb_available,
                'nb_copy'             => $book->nb_copy,
                'library_name'        => $book->library->name ?? 'Bibliothèque',
                'library_id'          => $book->library_id,
                'genre'               => $book->genre->name ?? null,
                'year_of_publication' => $book->year_of_publication,
                'isbn'                => $book->isbn,
            ],
            'copy'    => [
                'id'          => $copy->id,
                'status'      => $copy->status,
                'copy_state'  => $copy->copyState ? [
                    'id' => $copy->copyState->id,
                    'libelle_state' => $copy->copyState->libelle_state,
                    'color' => $copy->copyState->color,
                ] : null,
            ],
        ]);
    }
}