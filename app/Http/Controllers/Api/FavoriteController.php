<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $favorites = Favorite::with('book')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($favorites);
    }

    /**
     * Toggle favorite status for a book
     */
    public function toggle(Request $request, Book $book)
    {
        $user = $request->user();

        $favorite = Favorite::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'favorited' => false,
                'message' => 'Retiré des favoris',
            ]);
        }

        Favorite::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
        ]);

        return response()->json([
            'favorited' => true,
            'message' => 'Ajouté aux favoris',
        ]);
    }

    /**
     * Check if a book is favorited
     */
    public function check(Request $request, Book $book)
    {
        $user = $request->user();
        
        $isFavorite = Favorite::where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->exists();
        
        return response()->json(['is_favorite' => $isFavorite]);
    }
}