<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\Role_assignment;
use App\Models\Reservation;
use App\Models\Loan; 
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LibraryController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Récupérer les bibliothèques où l'utilisateur est admin
        $libraries = Library::where('administrator_id', $user->id)->get();

        // Ajouter les informations supplémentaires
        foreach ($libraries as $library) {
            $library->books_count = $library->books()->count();
            $library->members_count = $library->inscriptions()->count();
        }

        return response()->json($libraries);
    }

    public function show(Library $library)
    {
        $library->load([
            'administrator:id,name',
            'parent:id,name',
            'internalMembers.user:id,name',
        ]);

        return response()->json($library);
    }

    public function update(Request $request, Library $library)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'adress' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:libraries,id',
            'library_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',
            'loan_duration' => 'sometimes|integer|min:1',
            'daily_penalty_amount' => 'sometimes|numeric|min:0',
        ]);

        // Mise à jour des autres champs
        $data = $request->only('name', 'adress', 'description', 'parent_id');

        // Ajouter loan_duration et daily_penalty_amount s'ils sont présents
    if ($request->has('loan_duration')) {
        $data['loan_duration'] = $request->loan_duration;
    }
    if ($request->has('daily_penalty_amount')) {
        $data['daily_penalty_amount'] = $request->daily_penalty_amount;
    }
    
     // Gérer l'image si fournie
        if ($request->hasFile('library_image')) {
            if ($library->library_image) {
                Storage::disk('public')->delete($library->library_image);
            }
            $imagePath = $request->file('library_image')->store('library_images', 'public');
            $library->library_image = $imagePath;
        }
    $library->update($data);

        return response()->json([
            'message' => 'Bibliothèque mise à jour avec succès.',
            'library' => $library,
        ]);
    }

    public function join(Request $request)
    {
        $request->validate([
            'library_id' => 'required|exists:libraries,id',
            // 'library_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',

        ]);

        $user = $request->user();

        // Vérifier si l'utilisateur est déjà inscrit pour éviter les doublons
        $alreadyJoined = Inscription::where('user_id', $user->id)
            ->where('library_id', $request->library_id)
            ->exists();

        if ($alreadyJoined) {
            return response()->json(['message' => 'Vous êtes déjà membre de cette bibliothèque.'], 422);
        }

        Inscription::create([
            'user_id' => $user->id,
            'library_id' => $request->library_id,
            'date' => now(),
        ]);

        return response()->json(['message' => 'Félicitations, vous avez rejoint la bibliothèque !'], 201);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'adress' => 'required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:libraries,id',
            'library_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',
            'loan_duration' => 'nullable|integer|min:1',
            'daily_penalty_amount' => 'nullable|numeric|min:0',
        ]);

        // 1. Gérer l'image proprement
        $imagePath = null;
        if ($request->hasFile('library_image')) {
            $imagePath = $request->file('library_image')->store('library_images', 'public');
        }

        // 2. Vérification d'existence
        $exists = Library::where('name', $request->name)
            ->where('adress', $request->adress)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Cette bibliothèque existe déjà.'], 422);
        }

        // 3. Transaction
        return DB::transaction(function () use ($request, $imagePath) {
            $user = $request->user();

            $library = Library::create([
                'name' => $request->name,
                'library_image' => $imagePath,
                'parent_id' => $request->parent_id,
                'adress' => $request->adress,
                'description' => $request->description,
                'administrator_id' => $user->id,
                'loan_duration' => $request->loan_duration ?? 14,
                'daily_penalty_amount' => $request->daily_penalty_amount ?? 0,
            ]);

            $user->update(['role' => 'admin']);

            $member = Internal_member::create([
                'user_id' => $user->id,
                'library_id' => $library->id,
            ]);

            Role_assignment::create([
                'internal_member_id' => $member->id,
                'role_id' => 1,
                'date_assignment' => now(),
            ]);

            Inscription::create([
                'user_id' => $user->id,
                'library_id' => $library->id,
                'date' => now(),
            ]);

            return response()->json([
                'message' => 'Bibliothèque créée avec succès !',
                'library' => $library,
            ], 201);
        });
    }
    public function inscriptions($libraryId)
{
    $inscriptions = Inscription::with('user:id,name,email')
        ->where('library_id', $libraryId)
        ->get();

    return response()->json($inscriptions);
}
    
    // public function destroy(Library $library)
    // {
    //     // Selon ton métier, tu peux vérifier qu'il n'y a pas encore d'emprunts, etc.
    //     $library->delete();

    //     return response()->json([
    //         'message' => 'Bibliothèque supprimée avec succès.',
    //     ]);
    // }
    public function userLibraries(Request $request)
{
    $user = $request->user();
    
    $libraries = $user->inscriptions()
        ->with('library')
        ->get()
        ->map(function ($inscription) {
            return $inscription->library;
        });
    
    return response()->json($libraries);
}
// Récupérer les réservations de la bibliothèque
public function reservations($libraryId)
{
    $library = Library::findOrFail($libraryId);
    
    // Vérifier que l'utilisateur est admin de cette bibliothèque
    $user = auth()->user();
    if ($library->administrator_id !== $user->id) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }
    
    // Compter les réservations actives pour les livres de cette bibliothèque
    $reservationsCount = Reservation::whereHas('book', function($query) use ($libraryId) {
        $query->where('library_id', $libraryId);
    })->whereIn('status', ['active', 'notified'])->count();
    
    return response()->json([
        'count' => $reservationsCount,
        'reservations' => Reservation::whereHas('book', function($query) use ($libraryId) {
            $query->where('library_id', $libraryId);
        })->with(['user', 'book'])->whereIn('status', ['active', 'notified'])->get()
    ]);
}

// Récupérer tous les emprunts de la bibliothèque
public function loans($libraryId)
{
    $library = Library::findOrFail($libraryId);
    
    // Vérifier que l'utilisateur est admin de cette bibliothèque
    $user = auth()->user();
    if ($library->administrator_id !== $user->id) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }
    
    $loans = Loan::whereHas('copy.book', function($query) use ($libraryId) {
        $query->where('library_id', $libraryId);
    })
    ->with(['user', 'copy.book'])
    ->orderBy('created_at', 'desc')
    ->get();
    
    return response()->json($loans);
}
    public function destroy(Library $library)
    {

        $hasBooks = $library->books()->exists();
        if ($hasBooks) {
            return response()->json([
                'message' => 'Impossible de supprimer : cette bibliothèque contient encore des livres.',
            ], 422);
        }

        if ($library->library_image) {
            Storage::disk('public')->delete($library->library_image);
        }

        $library->delete();

        return response()->json([
            'message' => 'Bibliothèque supprimée avec succès.',
        ]);
    }
}
