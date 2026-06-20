<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\ContestationController;
use App\Http\Controllers\Api\FavoriteController;
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
use App\Models\Genre;
use Illuminate\Support\Facades\Route;

// -------------------------------------------------------------------------
// ROUTES PUBLIQUES
// -------------------------------------------------------------------------
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:5,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);

Route::get('/libraries', [LibraryController::class, 'index']);
Route::get('/libraries/{library}', [LibraryController::class, 'show']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/genres', fn () => response()->json(Genre::all()));

Route::post('/webhooks/kkiapay', [KkiapayController::class, 'handleWebhook']);
Route::middleware('auth:sanctum')->get('/verify-payment/{transactionId}', [KkiapayController::class, 'verify'])->where('transactionId', '.*');

// -------------------------------------------------------------------------
// ROUTES PROTÉGÉES
// -------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'verified'])->group(function () {

    // Auth
    Route::post('/profil/complete', [AuthController::class, 'completeProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profil', [ProfilController::class, 'show']);
    Route::put('/profil', [ProfilController::class, 'update']);
    Route::put('/profil/password', [ProfilController::class, 'updatePassword']);
    Route::get('/profile/status', [ProfilController::class, 'status']);

    // Casier bibliothécaire
    Route::get('/library-records', [RecordController::class, 'getLibraryRecords']);
    Route::post('/library-records', [RecordController::class, 'createLibraryRecord']);
    Route::get('/library-records/{id}', [RecordController::class, 'getLibraryRecordDetail']);
    Route::patch('/library-records/{id}/resolve', [RecordController::class, 'resolveLibraryRecord']);

    // Rapports
    Route::get('/libraries/{library}/reports/stats', [LibraryController::class, 'reportsStats']);
    Route::get('/libraries/{library}/reports/top-books', [LibraryController::class, 'topBooks']);
    Route::get('/libraries/{library}/reports/top-users', [LibraryController::class, 'topUsers']);
    Route::get('/libraries/{library}/reports/genre-distribution', [LibraryController::class, 'genreDistribution']);
    Route::get('/libraries/{library}/reports/active-penalties', [LibraryController::class, 'activePenalties']);
    Route::get('/libraries/children', [LibraryController::class, 'childrenLibraries']); 
    // Emprunts
    Route::get('/loans', [LoanController::class, 'index']);
    Route::post('/loans', [LoanController::class, 'store']);
    Route::post('/loans/{loan}/confirm-pickup', [LoanController::class, 'confirmPickup']);
    Route::post('/loans/{loan}/return', [LoanController::class, 'returnBook']);
    Route::get('/library-loans', [LoanController::class, 'libraryDashboard']);
    Route::get('/library-incidents', [LoanController::class, 'libraryIncidents']);
    Route::get('/user/incidents', [LoanController::class, 'userIncidents']);
    Route::patch('/incidents/{id}/resolve', [LoanController::class, 'resolveIncident']);
      Route::get('/copy-states', function () {
        return response()->json(\App\Models\CopyState::all());
    });

    // Bibliothèques — routes statiques AVANT apiResource pour éviter les conflits
    Route::get('/libraries/children', [LibraryController::class, 'childrenLibraries']);
    Route::apiResource('libraries', LibraryController::class)->except(['index', 'show']);
    Route::get('/my-managed-libraries', [LibraryController::class, 'myManagedLibraries']);
    Route::get('/user/libraries', [LibraryController::class, 'userLibraries']);
    Route::get('/libraries/{libraryId}/loans', [LibraryController::class, 'loans']);
    Route::get('/libraries/{libraryId}/waitlist', [LibraryController::class, 'waitlist']);
    Route::get('/libraries/{libraryId}/pending-pickups', [LibraryController::class, 'pendingPickups']);

    Route::get('/user/roles/{libraryId}', function ($libraryId) {
        $user = auth("sanctum")->user();

        return response()->json([
            'roles' => $user->getRolesInLibrary($libraryId),
            'is_admin' => $user->isLibraryAdmin($libraryId),
            'is_staff' => $user->isLibraryStaff($libraryId),
        ]);
    });
    // Pénalités
    Route::get('/my-penalties', [PenaltyController::class, 'getMyUnpaidPenalties']);
    Route::get('/penalties', [PenaltyController::class, 'index']);
    Route::get('/libraries/{libraryId}/penalties', [PenaltyController::class, 'getLibraryPenalties']);
    Route::patch('/penalties/{penaltyId}/pay', [PenaltyController::class, 'payPenalty']);
    Route::get('/libraries/{libraryId}/unpaid-penalties-count', [PenaltyController::class, 'getUnpaidPenaltiesCount']);

    // Clubs
    Route::get('/clubs', [ClubController::class, 'index']);
    Route::post('/clubs', [ClubController::class, 'store']);
    Route::post('/clubs/{id}/join', [ClubController::class, 'join']);
    Route::get('/clubs/{id}', [ClubController::class, 'show']);
    Route::delete('/clubs/{id}/leave', [ClubController::class, 'leave']);
    Route::delete('/clubs/{id}', [ClubController::class, 'destroy']);
    Route::get('/clubs/{id}/messages', [ClubController::class, 'getMessages']);
    Route::post('/clubs/{id}/messages', [ClubController::class, 'sendMessage']);
    Route::delete('/messages/{messageId}', [ClubController::class, 'deleteMessage']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Avis
    Route::get('books/{book}/reviews', [ReviewController::class, 'index']);
    Route::post('books/{book}/reviews', [ReviewController::class, 'store']);
    Route::post('/reviews/{review}/like', [ReviewController::class, 'like']);

    // Scan QR
    Route::get('/scan/{token}', [ScanController::class, 'handleScan']);

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

    // Livres (authentifiés)
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);
    Route::get('/books/{book}/copies', [BookController::class, 'getCopies']);

    // Paiements
    Route::post('/payments/create-for-penalty', [KkiapayController::class, 'createPaymentForPenalty']);
    Route::post('/payments/verify', [KkiapayController::class, 'verify']);
    Route::get('/payments/my-transactions', [KkiapayController::class, 'userTransactions']);
    Route::get('/libraries/{libraryId}/transactions', [KkiapayController::class, 'libraryTransactions']);

    // Contestations
    Route::get('/contestations', [ContestationController::class, 'index']);
    Route::post('/contestations', [ContestationController::class, 'store']);
    Route::get('/contestations/{id}', [ContestationController::class, 'show']);
    Route::post('/contestations/{id}/comment', [ContestationController::class, 'addComment']);
    Route::get('/contestations-library', [ContestationController::class, 'libraryContestations']);
    Route::get('/contestations-library-stats', [ContestationController::class, 'stats']);
    Route::post('/contestations-process/{id}', [ContestationController::class, 'process']);
});

// -------------------------------------------------------------------------
// ROUTES SUPER ADMIN
// -------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'super.admin', 'verified'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [App\Http\Controllers\Api\SuperAdminController::class, 'dashboardStats']);

    // Gestion des utilisateurs
    Route::get('/users', [App\Http\Controllers\Api\SuperAdminController::class, 'users']);
    Route::post('/users/make-super-admin', [App\Http\Controllers\Api\SuperAdminController::class, 'makeSuperAdmin']);
    Route::delete('/users/{id}/remove-super-admin', [App\Http\Controllers\Api\SuperAdminController::class, 'removeSuperAdmin']);

    // Gestion des demandes de bibliothèques
    Route::get('/library-requests', [App\Http\Controllers\Api\SuperAdminController::class, 'libraryRequests']);
    Route::post('/library-requests/{id}/approve', [App\Http\Controllers\Api\SuperAdminController::class, 'approveLibraryRequest']);
    Route::post('/library-requests/{id}/reject', [App\Http\Controllers\Api\SuperAdminController::class, 'rejectLibraryRequest']);

    // Suppression de bibliothèque (même déjà approuvée)
    Route::delete('/libraries/{id}', [App\Http\Controllers\Api\SuperAdminController::class, 'destroyLibrary']);
});

// -------------------------------------------------------------------------
// ROUTES ADMIN (Propriétaire de bibliothèque)
// -------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'check.lib.admin', 'verified'])->group(function () {
    Route::post('/libraries/{library_id}/members', [InternalMemberController::class, 'store']);
    Route::get('/libraries/{library_id}/members', [InternalMemberController::class, 'index']);
});

// -------------------------------------------------------------------------
// ROUTES STAFF (Bibliothécaires / Assistants)
// -------------------------------------------------------------------------
Route::middleware(['auth:sanctum', 'check.lib.staff', 'verified'])->group(function () {
    Route::post('/libraries/{library}/books', [BookController::class, 'store']);
    Route::put('/libraries/{library}/books/{id}', [BookController::class, 'update']);
    Route::delete('/libraries/{library}/books/{id}', [BookController::class, 'destroy']);
});
