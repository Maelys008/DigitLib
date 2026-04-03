<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\InternalMemberController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PenaltyController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Models\Badge;
use App\Models\Genre;
use Illuminate\Support\Facades\Route;


// -------------------------------------------------------------------------
// ROUTES PUBLIQUES (Authentification & Consultation)
// -------------------------------------------------------------------------

// Auth Standard
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:5,1');

// Mot de passe oublié
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

// Auth Sociale (Google, Facebook, etc.)
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

//Consultation de librairie
Route::get('/libraries', [LibraryController::class, 'index']);

// Consultation Livres (Public)
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);

Route::get('/genres', function () {
    return response()->json(Genre::all());
});

// -------------------------------------------------------------------------
// ROUTES PROTÉGÉES (Utilisateurs connectés)
// -------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    // --- Profil & Déconnexion ---
    Route::post('/profil/complete', [AuthController::class, 'completeProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profil', [ProfilController::class, 'show']);
    Route::put('/profil', [ProfilController::class, 'update']);
    Route::put('/profil/password', [ProfilController::class, 'updatePassword']);
    Route::get('/profile/status', [ProfilController::class, 'status']); //info sur le badge
    
    // Route::get('/badges', function () {
    //     return response()->json(Badge::orderBy('condition_of_obtaining', 'asc')->get());
    // });



    // --- Emprunts (Loans) ---
    Route::get('/loans', [LoanController::class, 'index']);           // Mes emprunts
    Route::post('/loans', [LoanController::class, 'store']);          // Emprunter
    // Route::put('/loans/{id}', [LoanController::class, 'update']);     // Retourner
    Route::get('/library-loans', [LoanController::class, 'libraryDashboard']); // Dashboard Admin

    // --- Bibliothèques (Libraries) ---
    Route::post('/libraries/join', [LibraryController::class, 'join']);
    Route::apiResource('libraries', LibraryController::class)->except(['index']);
    Route::get('/my-managed-libraries', [LibraryController::class, 'myManagedLibraries']);
    Route::get('/libraries/{library}/inscriptions', [LibraryController::class, 'inscriptions']);
    Route::get('/user/libraries', [LibraryController::class, 'userLibraries']);
    Route::get('/libraries/{library}/reservations', [LibraryController::class, 'reservations']);
    Route::get('/libraries/{library}/loans', [LibraryController::class, 'loans']);
    // --- Pénalités ---
    Route::get('/penalties', [PenaltyController::class, 'index']);
    Route::patch('/penalties/{id}/pay', [PenaltyController::class, 'payPenalty']);
    Route::get('/libraries/{library}/unpaid-penalties-count', [PenaltyController::class, 'getUnpaidPenaltiesCount']);

    // --- Clubs de lecture ---
    Route::get('/clubs', [ClubController::class, 'index']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::post('/clubs/{id}/join', [ClubController::class, 'join']);
    Route::delete('/clubs/{id}/leave', [ClubController::class, 'leave']);

    // Messagerie des Clubs
    Route::get('/clubs/{id}/messages', [ClubController::class, 'getMessages']);
    Route::post('/clubs/{id}/messages', [ClubController::class, 'sendMessage']);
    Route::delete('/messages/{messageId}', [ClubController::class, 'deleteMessage']);

    // --- Notifications ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    Route::get('books/{book}/reviews', [ReviewController::class, 'index']);    // Voir les avis d'un livre
    Route::post('books/{book}/reviews', [ReviewController::class, 'store']);   // Ajouter/Modifier son avis
    Route::post('/reviews/{review}/like', [ReviewController::class, 'like']); // Liker un avis
});

// ---------------------------------------------------------------------
// ROUTES ADMIN (Propriétaire de bibliothèque)
// ---------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'check.lib.admin', 'verified'])->group(function () {
    Route::get('/libraries/{library}/stats', function () {
        return response()->json(['message' => 'Accès autorisé aux stats privées']);
    });
    Route::post('/libraries/{library_id}/members', [InternalMemberController::class, 'store']);    // Route pour voir l'équipe
    Route::get('/libraries/{library_id}/members', [InternalMemberController::class, 'index']);
});

// ---------------------------------------------------------------------
// ROUTES STAFF (Bibliothécaires / Gestionnaires)
// ---------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'check.lib.staff', 'verified'])->group(function () {
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);


    Route::post('/libraries/{library}/books', [BookController::class, 'store']);
    Route::put('/libraries/{library}/books/{id}', [BookController::class, 'update']);
    Route::delete('/libraries/{library}/books/{id}', [BookController::class, 'destroy']);

    Route::post('/loans/{loan}/return', [LoanController::class, 'returnBook']);
    Route::get('/library-incidents', [LoanController::class, 'libraryIncidents']);
});
