<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function store(Request $request, $bookId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:10',
        ]);

        /** @var User $user */
        $user = $request->user();

        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'book_id' => $bookId],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        return response()->json(['message' => 'Merci pour votre avis !', 'review' => $review], 201);
    }

    public function like($reviewId)
    {
        $review = Review::findOrFail($reviewId);
        /** @var User $user */
        $user = auth('sanctum')->user();

        $alreadyLiked = DB::table('review_likes')
            ->where('user_id', $user->id)
            ->where('review_id', $reviewId)
            ->exists();

        if ($alreadyLiked) {
            DB::table('review_likes')->where('user_id', $user->id)->where('review_id', $reviewId)->delete();
            $review->decrement('likes_count');

            return response()->json(['message' => 'Like retiré.']);
        }

        DB::table('review_likes')->insert([
            'user_id' => $user->id,
            'review_id' => $reviewId,
            'created_at' => now(),
        ]);

        $review->increment('likes_count');

        return response()->json(['message' => 'Vous avez trouvé cet avis utile.']);
    }

    public function index($bookId)
    {
        $reviews = Review::where('book_id', $bookId)
            ->with('user:id,name')
            ->orderBy('likes_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reviews);
    }
}
