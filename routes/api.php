<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\InternalMemberController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PenalityController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

// Routes pour l'Auth Sociale
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);


Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('books', BookController::class)
        ->except(['index', 'show']);

    Route::apiResource('loans', LoanController::class);
    Route::post('/completeProfile', [AuthController::class, 'completeProfile']);

    Route::post('/libraries/join', [LibraryController::class, 'join']);
    Route::apiResource('libraries', LibraryController::class);

    Route::patch('/penalities/{id}/pay', [PenalityController::class, 'payPenalty']);

    Route::post('/logout', [AuthController::class, 'logout']);

    // Gestion des Clubs
    Route::get('/clubs', [ClubController::class, 'index']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::post('/clubs/{id}/join', [ClubController::class, 'join']);

    // Messagerie des Clubs
    Route::get('/clubs/{id}/messages', [ClubController::class, 'getMessages']);
    Route::post('/clubs/{id}/messages', [ClubController::class, 'sendMessage']);
    Route::delete('/messages/{messageId}', [ClubController::class, 'deleteMessage']);
    
    // Quitter un club
    Route::delete('/clubs/{id}/leave', [ClubController::class, 'leave']);




    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::get('/profile/status', function (Request $request) {
        $user = $request->user()->load('badge');
        $nextBadge = Badge::where('condition_of_obtaining', '>', $user->score)
            ->orderBy('condition_of_obtaining', 'asc')
            ->first();

        return response()->json([
            'user' => $user,
            'stats' => [
                'current_loans' => $user->loans()->whereNull('actual_return_date')->count(),
                'max_books_allowed' => $user->badge->maximum_book ?? 2,
                'points_to_next_level' => $nextBadge ? ($nextBadge->condition_of_obtaining - $user->score) : 0,
                'next_badge_name' => $nextBadge->name ?? 'Niveau Max atteint'
            ]
        ]);
    });
});

Route::middleware(['auth:sanctum', 'check.lib.admin'])->group(function () {

    Route::get('/libraries/{library}/stats', function () {
        return response()->json(['message' => 'Accès autorisé aux stats privées']);
    });

    Route::post('/libraries/{library}/members', [InternalMemberController::class, 'store']);

    // Route pour voir l'équipe
    Route::get('/libraries/{library}/members', [InternalMemberController::class, 'index']);
});




Route::middleware(['auth:sanctum', 'check.lib.staff'])->group(function () {
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);
});




Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
