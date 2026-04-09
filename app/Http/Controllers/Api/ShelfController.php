<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Shelf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShelfController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $shelves = Shelf::withCount('books')
            ->where('user_id', $request->user()->id)
            ->get();

        return response()->json($shelves);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
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
            'cover_image' => $data['cover_image'] ?? null,
        ]);

        return response()->json($shelf, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, $id)
    {
        $shelf = Shelf::with('books')
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($shelf);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shelf $Shelf)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Shelf $shelf, $id)
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $shelf->delete();

        return response()->json(['message' => 'Étagère supprimée']);
    }

    /**
     * Attach a book to a shelf
     */
    public function attachBook(Request $request, $shelfId, $bookId)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $shelfId)
            ->firstOrFail();

        $shelf->books()->syncWithoutDetaching([$bookId]);

        return response()->json(['message' => 'Livre ajouté à l\'étagère']);
    }

    /**
     * Detach a book from a shelf
     */
    public function detachBook(Request $request, $shelfId, $bookId)
    {
        $shelf = Shelf::where('user_id', $request->user()->id)
            ->where('id', $shelfId)
            ->firstOrFail();

        $shelf->books()->detach($bookId);

        return response()->json(['message' => 'Livre retiré de l\'étagère']);
    }
}
