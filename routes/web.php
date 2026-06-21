<?php

use App\Http\Controllers\Api\KkiapayController;
use App\Models\Book;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;


// Routes d'authentification
Route::get('/login', function () {
    return Inertia::render('Auth/Login');
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Auth/Register');
})->name('register');

Route::get('/verify-otp', function () {
    return Inertia::render('Auth/VerifyOtp');
})->name('verify.otp');

Route::get('/complete-profile', function () {
    return Inertia::render('Auth/CompleteProfile');
})->name('complete.profile');

Route::get('/forgot-password', function () {
    return Inertia::render('Auth/ForgotPassword');
})->name('password.request');
Route::get('/', function () {
    return Inertia::render('home');
})->name('home');
Route::get('/best-of-month', function () {
    return Inertia::render('BestOfMonth');
});


Route::get('/genres', function () {
    return Inertia::render('Genres');
})->name('genres.index');

Route::get('/genres/{genre}', function ($genre) {
    return Inertia::render('GenreBooks', [
        'genre' => $genre,
    ]);
})->name('genre.books');

Route::get('/nouveautes', function () {
    return Inertia::render('NewReleases');
})->name('nouveautes');

Route::get('/romans', function () {
    return Inertia::render('Romans');
})->name('romans');

Route::get('/populaires', function () {
    return Inertia::render('Populaires');
})->name('populaires');

Route::get('/editeurs', function () {
    return Inertia::render('Editeurs');
})->name('editeurs');

Route::get('/book/{id}', function ($id) {
    return Inertia::render('BookDetail', [
        'id' => (int) $id,
    ]);
});

Route::get('/book/{id}/reviews', function ($id) {
    return Inertia::render('AllReviews', [
        'bookId' => (int) $id,
        'bookTitle' => 'Titre du livre',
        'reviews' => [],
    ]);
})->name('book.reviews');

Route::get('/search', function () {
    return Inertia::render('SearchPage');
})->name('search');

Route::get('/scanner', function () {
    return Inertia::render('ScannerPage');
})->name('scanner');

Route::get('/profile', function () {
    return Inertia::render('Profile');
})->name('profile');

Route::get('/profile/edit', function () {
    return Inertia::render('EditProfile');
})->name('profile.edit');
Route::get('/profile/cards', function () {
    return Inertia::render('MyCards');
})->name('profile.cards');

Route::get('/profile/settings', function () {
    return Inertia::render('Settings');
})->name('profile.settings');

Route::get('/profile/support', function () {
    return Inertia::render('Support');
})->name('profile.support');

Route::get('/library', function () {
    return Inertia::render('Library');
})->name('library');
Route::get('/shelves', function () {
    return Inertia::render('Shelves');
})->name('shelves');

Route::get('/shelves/create', function () {
    return Inertia::render('CreateShelf');
})->name('shelves.create');

Route::get('/shelves/{id}', function ($id) {
    return Inertia::render('ShelfDetail', [
        'id' => (int) $id,
    ]);
})->name('shelves.detail');

Route::get('/shelves/{id}/edit', function ($id) {
    return Inertia::render('EditShelf', [
        'id' => (int) $id,
    ]);
})->name('shelves.edit');
Route::get('/favorites', function () {
    return Inertia::render('Favorites');
})->name('favorites');

Route::get('/read-books', function () {
    return Inertia::render('ReadBooks');
})->name('read.books');

Route::get('/librarian/create', function () {
    return Inertia::render('Librarian/CreateLibrary');
})->name('librarian.create');

Route::get('/librarian/dashboard', function () {
    return Inertia::render('Librarian/Dashboard');
})->name('librarian.dashboard');
Route::get('/librarian/books', function () {
    return Inertia::render('Librarian/Books');
})->name('librarian.books');
Route::get('/librarian/books/{id}', function ($id) {
    return Inertia::render('Librarian/BookDetail', [
        'id' => (int) $id,
    ]);
})->name('librarian.books.detail');
Route::get('/librarian/books/{id}/edit', function ($id) {
    return Inertia::render('Librarian/EditBook', [
        'id' => (int) $id,
    ]);
})->name('librarian.books.edit');
Route::get('/librarian/internal-members', function () {
    return Inertia::render('Librarian/InternalMembers');
})->name('librarian.internal-members');
Route::get('/librarian/settings', function () {
    return Inertia::render('Librarian/Settings');
})->name('librarian.settings');
Route::get('/librarian/library/{id}', function ($id) {
    return Inertia::render('Librarian/LibraryDetail', [
        'id' => (int) $id,
    ]);
})->name('librarian.library.detail');
Route::get('/notifications', function () {
    return Inertia::render('Notifications');
})->name('notifications');
Route::get('/notifications/{id}', function ($id) {
    return Inertia::render('NotificationDetail', ['id' => $id]);
})->name('notifications.show');
Route::get('/librarian/borrowing-rules', function () {
    return Inertia::render('Librarian/BorrowingRules');
})->name('librarian.borrowing-rules');
Route::get('/librarian/manage-users', function () {
    return Inertia::render('Librarian/ManageUsers');
});
Route::get('/reset-password', function () {
    return Inertia::render('Auth/ResetPassword');
})->name('reset-password');
Route::get('/forgot-password', function () {
    return Inertia::render('Auth/ForgotPassword');
})->name('password.forgot');
Route::get('/libraries/{id}', function ($id) {
    return Inertia::render('LibraryDetails', ['id' => $id]);
})->name('library.details');
Route::get('/libraries', function () {
    return Inertia::render('AllLibraries');
})->name('libraries.index');
Route::get('/librarian/manage-penalties', function () {
    return Inertia::render('Librarian/ManagePenalties');
})->name('librarian.manage-penalties');
Route::get('/profile', function () {
    return Inertia::render('Profile');
})->name('profile');

Route::get('/profile/edit', function () {
    return Inertia::render('EditProfile');
})->name('profile.edit');

Route::get('/profile/change-password', function () {
    return Inertia::render('ChangePassword');
})->name('profile.change-password');

Route::get('/clubs', function () {
    return Inertia::render('Clubs/Index');
})->name('clubs.index');

Route::get('/clubs/create', function () {
    return Inertia::render('Clubs/Create');
})->name('clubs.create');

Route::get('/clubs/{id}', function ($id) {
    return Inertia::render('Clubs/Show', ['id' => $id]);
})->name('clubs.show');
Route::get('/librarian/incidents', function () {
    return Inertia::render('Librarian/Incidents');
})->name('librarian.incidents');
Route::get('/librarian/partner-libraries', function () {
    return Inertia::render('Librarian/PartnerLibraries');
})->name('librarian.partner-libraries');
Route::get('/auth/{provider}/callback', function ($provider) {
    // Le backend gère la redirection
    return Inertia::location('/api/auth/'.$provider.'/callback');
});
Route::get('/auth/callback', function () {
    // Récupérer les paramètres de l'URL
    $token = request()->query('token');
    $isSuperAdmin = request()->query('is_super_admin', 0);
    
    // Passer les données à la vue Inertia
    return Inertia::render('Auth/Callback', [
        'token' => $token,
        'is_super_admin' => $isSuperAdmin == 1,
    ]);
})->name('auth.callback');
Route::get('/librarian/books/{book}/copies', function ($bookId) {
    // Récupère le livre pour avoir son titre et auteur
    $book = Book::findOrFail($bookId);

    return Inertia::render('Librarian/ManageCopies', [
        'bookId' => $bookId,
        'bookTitle' => $book->title,
        'bookAuthor' => $book->author,
    ]);
})->name('librarian.books.copies');
Route::get('/librarian/library-records', function () {
    return inertia('Librarian/LibraryRecords');
})->name('library.records');

Route::get('/librarian/library-records/{id}', function ($id) {
    return inertia('Librarian/LibraryRecordDetail', ['id' => $id]);
})->name('library.records.show');
// Routes pour les incidents (à ajouter dans web.php)
Route::get('/librarian/incidents', function () {
    return Inertia::render('Librarian/Incidents');
})->name('librarian.incidents');

Route::get('/librarian/incidents/{id}', function ($id) {
    return Inertia::render('Librarian/IncidentDetail', ['id' => $id]);
})->name('librarian.incidents.show');

Route::get('/librarian/incidents/create', function () {
    return Inertia::render('Librarian/CreateIncident');
})->name('librarian.incidents.create');
Route::post('/set-active-library', function (Request $request) {
    session(['active_library_id' => $request->library_id]);
    return response()->json(['success' => true]);
});




// // 1. Afficher la page de test
// Route::get('/pay', function () {
//     return view('test-payment');
// });

// // 2. Route de retour après succès
// Route::get('/verify-payment/{transactionId}', [KkiapayController::class, 'verify'])
//     ->name('payment.success');

// 2. Route de retour après succès
// Route::get('/verify-payment/{transactionId}', [KkiapayController::class, 'verify'])
//     ->name('payment.success');
    // ==================== ROUTES POUR LES CONTESTATIONS (CÔTÉ READER) ====================
// Changement : Profile/ContestationList → Contestations/ContestationList
Route::get('/profile/contestations', function () {
    return Inertia::render('Contestations/ContestationList');  // ← MODIFIÉ
})->name('profile.contestations');

Route::get('/profile/contestations/{id}', function ($id) {
    return Inertia::render('Contestations/ContestationDetail', ['id' => (int) $id]);  // ← MODIFIÉ
})->name('profile.contestations.show');

// ==================== ROUTES POUR LES CONTESTATIONS (CÔTÉ BIBLIOTHÉCAIRE) ====================
// Celles-ci restent identiques car elles pointent vers Librarian/
Route::get('/librarian/contestations', function () {
    return Inertia::render('Librarian/ContestationManagement');
})->name('librarian.contestations');

Route::get('/librarian/contestations/{id}', function ($id) {
    return Inertia::render('Librarian/ContestationDetail', ['id' => (int) $id]);
})->name('librarian.contestations.show');
Route::get('/profile/incidents', function () {
    return Inertia::render('Contestations/MyIncidents');
})->name('profile.incidents');
Route::get('/payment-callback', function () {
    $transactionId = request()->query('transaction_id');
    return Inertia::render('PaymentCallback', ['transactionId' => $transactionId]);
})->name('payment.callback');
Route::get('/librarian/reports', function () {
    return Inertia::render('Librarian/Reports');
})->name('librarian.reports');
Route::prefix('super-admin')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('SuperAdmin/Dashboard');
    })->name('super-admin.dashboard');
    
    Route::get('/users', function () {
        return Inertia::render('SuperAdmin/Users');
    })->name('super-admin.users');
    
    Route::get('/library-requests', function () {
        return Inertia::render('SuperAdmin/LibraryRequests');
    })->name('super-admin.library-requests');
       Route::get('/notifications', function () {
        return Inertia::render('SuperAdmin/Notifications');
    })->name('super-admin.notifications');
});
require __DIR__.'/auth.php';
