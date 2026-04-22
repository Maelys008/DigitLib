<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Shelf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShelfController extends Controller
{
    public function index(Request $request)
    {
        $shelves = Shelf::withCount('books')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($shelves);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'shelf_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',
        ]);

        if ($request->hasFile('shelf_image')) {
            $path = $request->file('shelf_image')->store('selves', 'public');
            $data['shelf_image'] = $path;
        }

        $shelf = Shelf::create([
            'user_id' => $request->user()->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'shelf_image' => $data['shelf_image'] ?? null,  // ← CORRIGÉ : shelf_image au lieu de cover_image
        ]);

        return response()->json($shelf, 201);
    }

    public function show(Request $request, $id)
    {
        $shelf = Shelf::with('books')
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($shelf);
    }

    public function update(Request $request, $id)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'shelf_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',
        ]);

        if ($request->hasFile('shelf_image')) {
            if ($shelf->shelf_image) {
                Storage::disk('public')->delete($shelf->shelf_image);
            }

            $path = $request->file('shelf_image')->store('selves', 'public');
            $data['shelf_image'] = $path;
        }

        $shelf->update($data);

        return response()->json($shelf);
    }

    public function destroy(Request $request, $id)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $shelf->delete();

        return response()->json(['message' => 'Étagère supprimée']);
    }

    public function attachBook(Request $request, $shelfId, $bookId)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $shelfId)
            ->firstOrFail();

        $shelf->books()->syncWithoutDetaching([$bookId]);

        return response()->json(['message' => 'Livre ajouté à l\'étagère']);
    }

    public function detachBook(Request $request, $shelfId, $bookId)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $shelfId)
            ->firstOrFail();

        $shelf->books()->detach($bookId);

        return response()->json(['message' => 'Livre retiré de l\'étagère']);
    }
}