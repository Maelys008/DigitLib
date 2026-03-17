<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscription;
use App\Models\Library;
use Illuminate\Http\Request;

class LibraryController extends Controller
{
    public function join(Request $request)
    {
        $request->validate([
            'library_id' => 'required|exists:libraries,id'
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
            'name' => 'required|string',
            'adress' => 'required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:libraries,id',
        ]);

        $library = Library::create([
            'name' => $request->name,
            'parent_id' => $request->parent_id,
            'adress' => $request->adress,
            'description' => $request->description,
            'administrator_id' => $request->user()->id, // L'utilisateur devient admin
        ]);

        $request->user()->update(['role' => 'admin']);

        return response()->json($library, 201);
    }
}
