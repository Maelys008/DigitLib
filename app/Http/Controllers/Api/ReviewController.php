<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Book;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    private function updateBookRating($bookId)
    {
        $averageRating = Review::where('book_id', $bookId)->avg('rating');
        $book = Book::find($bookId);
        if ($book) {
            $book->note = $averageRating ? round($averageRating, 1) : 0;
            $book->save();
        }
    }

    public function store(Request $request, $bookId)
    {
        try {
            $request->validate([
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string|min:10',
            ]);

            $user = $request->user();

            $review = Review::updateOrCreate(
                ['user_id' => $user->id, 'book_id' => $bookId],
                ['rating' => $request->rating, 'comment' => $request->comment]
            );

            $this->updateBookRating($bookId);

            return response()->json([
                'message' => 'Merci pour votre avis !', 
                'review' => $review->load('user:id,name')
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Erreur store review: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de l\'ajout de l\'avis'], 500);
        }
    }

   public function like($reviewId)
{
    try {
        $review = Review::findOrFail($reviewId);
        
        // Version avec toggle (like/unlike) mais sans table
        // On utilise session pour stocker les likes temporairement
        $likedReviews = session()->get('liked_reviews', []);
        
        if (in_array($reviewId, $likedReviews)) {
            $review->decrement('likes_count');
            $likedReviews = array_diff($likedReviews, [$reviewId]);
            $message = 'Like retiré.';
            $isLiked = false;
        } else {
            $review->increment('likes_count');
            $likedReviews[] = $reviewId;
            $message = 'Vous avez trouvé cet avis utile.';
            $isLiked = true;
        }
        
        session()->put('liked_reviews', $likedReviews);
        $newCount = $review->fresh()->likes_count;

        return response()->json([
            'message' => $message,
            'likes_count' => $newCount,
            'is_liked' => $isLiked
        ]);
        
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur lors du like'], 500);
    }
}

    public function index($bookId)
    {
        try {
            $reviews = Review::where('book_id', $bookId)
                ->with('user:id,name')
                ->orderBy('likes_count', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            // Pas de is_liked car on ne suit pas les likes individuels
            foreach ($reviews as $review) {
                $review->is_liked = false;
            }

            return response()->json($reviews);
            
        } catch (\Exception $e) {
            \Log::error('Erreur index reviews: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors du chargement des avis'], 500);
        }
    }
}