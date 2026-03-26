<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\Role_assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
    public function join(Request $request)
    {
        $request->validate([
            'library_id' => 'required|exists:libraries,id',
            'library_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',

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
            'date' => now()
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
            'administrator_id' => $user->id
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
            'date' => now()
        ]);

        return response()->json([
            'message' => 'Bibliothèque créée avec succès !',
            'library' => $library
        ], 201);
    });
}
    }
