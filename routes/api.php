<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\ContestationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\InternalMemberController;
use App\Http\Controllers\Api\KkiapayController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PenaltyController;
use App\Http\Controllers\Api\ProfilController;
use App\Http\Controllers\Api\RecordController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ScanController;
use App\Http\Controllers\Api\ShelfController;
use App\Http\Controllers\Api\SocialAuthController;
use App\Models\Badge;
use App\Models\Genre;
use App\Models\User;
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

// Consultation de librairie
Route::get('/libraries', [LibraryController::class, 'index']);

// Consultation Livres (Public)
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);

Route::get('/genres', function () {
    return response()->json(Genre::all());
});

// Webhook
Route::post('/webhooks/kkiapay', [KkiapayController::class, 'handleWebhook']);

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
    Route::get('/profile/status', [ProfilController::class, 'status']); // info sur le badge

    // casier bibliothécaire
    Route::get('/library-records', [RecordController::class, 'getLibraryRecords']);
    Route::post('/library-records', [RecordController::class, 'createLibraryRecord']);
    Route::get('/library-records/{id}', [RecordController::class, 'getLibraryRecordDetail']);
    Route::patch('/library-records/{id}/resolve', [RecordController::class, 'resolveLibraryRecord']);

    // ==================== RAPPORTS ====================
    Route::get('/libraries/{library}/reports/stats', [LibraryController::class, 'reportsStats']);
    Route::get('/libraries/{library}/reports/top-books', [LibraryController::class, 'topBooks']);
    Route::get('/libraries/{library}/reports/top-users', [LibraryController::class, 'topUsers']);
    Route::get('/libraries/{library}/reports/genre-distribution', [LibraryController::class, 'genreDistribution']);
    Route::get('/libraries/{library}/reports/active-penalties', [LibraryController::class, 'activePenalties']);

    // --- Emprunts (Loans) ---
    Route::get('/loans', [LoanController::class, 'index']);           // Mes emprunts
    Route::post('/loans', [LoanController::class, 'store']);          // Emprunter
    // Route::put('/loans/{id}', [LoanController::class, 'update']);     // Retourner
    Route::get('/library-loans', [LoanController::class, 'libraryDashboard']); // Dashboard Admin
    Route::get('/library-incidents', [LoanController::class, 'libraryIncidents']);

    // --- Bibliothèques (Libraries) ---
    Route::post('/libraries/join', [LibraryController::class, 'join']);
    Route::apiResource('libraries', LibraryController::class)->except(['index']);
    Route::get('/my-managed-libraries', [LibraryController::class, 'myManagedLibraries']);
    Route::get('/libraries/{library}/inscriptions', [LibraryController::class, 'inscriptions']);
    Route::get('/user/libraries', [LibraryController::class, 'userLibraries']);
    Route::get('/libraries/{libraryId}/loans', [LibraryController::class, 'loans']);
    Route::get('/libraries/{libraryId}/reservations', [LibraryController::class, 'reservations']);
    Route::get('/libraries/{libraryId}/active-reservations', [LibraryController::class, 'activeReservations']); // Nouvelle
    Route::get('/libraries/{libraryId}/pending-pickups', [LibraryController::class, 'pendingPickups']); // Nouvelle
    Route::get('/libraries/partners', [LibraryController::class, 'partnerLibraries']);
    Route::get('/libraries/children', [LibraryController::class, 'childrenLibraries']);
    // --- Pénalités ---
    Route::get('/penalties', [PenaltyController::class, 'index']);
    Route::get('/libraries/{libraryId}/penalties', [PenaltyController::class, 'getLibraryPenalties']);
    Route::patch('/penalties/{penaltyId}/pay', [PenaltyController::class, 'payPenalty']);
    Route::get('/libraries/{libraryId}/unpaid-penalties-count', [PenaltyController::class, 'getUnpaidPenaltiesCount']);

    // --- Clubs de lecture ---
    Route::get('/clubs', [ClubController::class, 'index']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::post('/clubs/{id}/join', [ClubController::class, 'join']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::delete('/clubs/{id}/leave', [ClubController::class, 'leave']);
    Route::delete('/clubs/{id}', [ClubController::class, 'destroy']);

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

    // Scan Book
    Route::get('/scan/{token}', [ScanController::class, 'handleScan']);
    Route::get('/scan-user/{token}', function ($token) {
        try {
            $decoded = base64_decode($token);
            $data = json_decode($decoded, true);

            if ($data && isset($data['type']) && $data['type'] === 'user_profile') {
                $user = User::with('badge')->find($data['id']);
                if ($user) {
                    return response()->json([
                        'success' => true,
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'badge' => $user->badge?->name ?? 'Bronze',
                            'score' => $user->score ?? 0,
                            'borrowedBooks' => $user->loans()->whereNull('actual_return_date')->count(),
                        ],
                    ]);
                }
            }

            return response()->json(['success' => false, 'message' => 'QR code invalide'], 404);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'QR code invalide'], 404);
        }
    });
    Route::patch('/incidents/{id}/resolve', [LoanController::class, 'resolveIncident']);

    // Favoris
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle/{book}', [FavoriteController::class, 'toggle']);
    Route::get('/favorites/check/{book}', [FavoriteController::class, 'check']);

    // Étagères
    Route::get('/shelves', [ShelfController::class, 'index']);
    Route::post('/shelves', [ShelfController::class, 'store']);
    Route::get('/shelves/{shelf}', [ShelfController::class, 'show']);
    Route::post('/shelves/{shelf}/books/{book}', [ShelfController::class, 'attachBook']);
    Route::delete('/shelves/{shelf}/books/{book}', [ShelfController::class, 'detachBook']);
    Route::put('/shelves/{shelf}', [ShelfController::class, 'update']);
    Route::delete('/shelves/{shelf}', [ShelfController::class, 'destroy']);

    // --- Paiements ---
    Route::post('/payments/create-for-penalty', [KkiapayController::class, 'createPaymentForPenalty']);
    Route::post('/payments/verify', [KkiapayController::class, 'verify']);
    Route::get('/payments/my-transactions', [KkiapayController::class, 'userTransactions']);
    Route::get('/libraries/{libraryId}/transactions', [KkiapayController::class, 'libraryTransactions']);

    // --- Contestations ---
    Route::prefix('contestations')->group(function () {
        // Pour tous les utilisateurs
        Route::get('/', [ContestationController::class, 'index']);
        Route::post('/', [ContestationController::class, 'store']);
        Route::get('/{id}', [ContestationController::class, 'show']);
        Route::post('/{id}/comment', [ContestationController::class, 'addComment']);

        // Pour les bibliothécaires
        Route::get('/library/all', [ContestationController::class, 'libraryContestations']);
        Route::get('/library/stats', [ContestationController::class, 'stats']);
        Route::post('/{id}/process', [ContestationController::class, 'process']);
    });
});

// ---------------------------------------------------------------------
// ROUTES ADMIN (Propriétaire de bibliothèque)
// ---------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'check.lib.admin', 'verified'])->group(function () {
    // Route::get('/libraries/{library}/stats', function () {
    //     return response()->json(['message' => 'Accès autorisé aux stats privées']);
    // });
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

    Route::get('/books/{book}/copies', [BookController::class, 'getCopies']);

    Route::post('/loans/{loan}/confirm-pickup', [LoanController::class, 'confirmPickup']);
    Route::post('/loans/{loan}/return', [LoanController::class, 'returnBook']);
    // Dans la section protégée (middleware auth:sanctum)
    // Dans la section protégée
    // Route::prefix('incidents')->group(function () {
    //     Route::get('/', [IncidentController::class, 'getLibraryIncidents']); // Récupérer incidents de SA bibliothèque
    //     Route::post('/', [IncidentController::class, 'store']); // Créer un incident
    //     Route::patch('/{id}/resolve', [IncidentController::class, 'resolve']); // Résoudre
    // });
});
