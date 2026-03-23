<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
});

Route::get('/best-of-month', function () {
    return Inertia::render('BestOfMonth');  
});
Route::get('/genres', function () {
    return Inertia::render('Genres');
})->name('genres.index');
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
// Route pour les détails de livre
Route::get('/book/{id}', function ($id) {
    // Pour l'instant, on passe juste l'ID
    return Inertia::render('BookDetail', [
        'id' => (int)$id
    ]);
});
Route::get('/book/{id}/reviews', function ($id) {
    return Inertia::render('AllReviews', [
        'bookId' => (int)$id,
        'bookTitle' => 'Titre du livre', 
        'reviews' => [] 
    ]);
})->name('book.reviews');
Route::get('/genres/{genre}', function ($genre) {
    return Inertia::render('GenreBooks', [
        'genre' => $genre
    ]);
})->name('genre.books');
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
Route::get('/library', function () {
    return Inertia::render('Library');
})->name('library');
// Page des étagères
Route::get('/shelves', function () {
    return Inertia::render('Shelves');
})->name('shelves');

// Création d'étagère
Route::get('/shelves/create', function () {
    return Inertia::render('CreateShelf');
})->name('shelves.create');

// Détail d'une étagère
Route::get('/shelves/{id}', function ($id) {
    return Inertia::render('ShelfDetail', [
        'id' => $id
    ]);
})->name('shelves.detail');
// Favoris
Route::get('/favorites', function () {
    return Inertia::render('Favorites');
})->name('favorites');

// Livres lus
Route::get('/read-books', function () {
    return Inertia::render('ReadBooks');
})->name('read.books');
// Détail d'une étagère
Route::get('/shelves/{id}', function ($id) {
    return Inertia::render('ShelfDetail', [
        'id' => (int)$id
    ]);
})->name('shelves.detail');

// Édition d'une étagère
Route::get('/shelves/{id}/edit', function ($id) {
    return Inertia::render('EditShelf', [
        'id' => (int)$id
    ]);
})->name('shelves.edit');
/*Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});*/

require __DIR__.'/auth.php';
