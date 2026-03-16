<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\PenalityController;
use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// Routes pour l'Auth Sociale
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);


Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('books', BookController::class)
        ->except(['index', 'show']);

    Route::apiResource('loans', LoanController::class);
    Route::post('/completeProfile', [AuthController::class, 'completeProfile']);

    Route::post('/libraries/join', [LibraryController::class, 'join'])->middleware('auth:sanctum');
    Route::patch('/penalities/{id}/pay', [PenalityController::class, 'payPenalty']);

    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
