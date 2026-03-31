<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
    return Inertia::render('Home');
})->name('home');

Route::get('/best-of-month', function () {
    return Inertia::render('BestOfMonth');  
});

Route::get('/genres', function () {
    return Inertia::render('Genres');
})->name('genres.index');

Route::get('/genres/{genre}', function ($genre) {
    return Inertia::render('GenreBooks', [
        'genre' => $genre
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
        'id' => (int)$id
    ]);
})->name('shelves.detail');

Route::get('/shelves/{id}/edit', function ($id) {
    return Inertia::render('EditShelf', [
        'id' => (int)$id
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
        'id' => (int)$id
    ]);
})->name('librarian.books.detail');
Route::get('/librarian/books/{id}/edit', function ($id) {
    return Inertia::render('Librarian/EditBook', [
        'id' => (int)$id
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
        'id' => (int)$id
    ]);
})->name('librarian.library.detail');
Route::get('/notifications', function () {
    return Inertia::render('Notifications');
})->name('notifications');
require __DIR__.'/auth.php';