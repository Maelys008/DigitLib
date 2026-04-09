<?php

namespace App\Http\Controllers;

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
            ...$data,
        ]);

        return response()->json($shelf, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Shelf $shelf)
    {
        $this->authorizeShelf($request, $shelf);

        $shelf->load('books');

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
    public function update(Request $request, Shelf $shelf)
    {
        $this->authorizeShelf($request, $shelf);

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
    public function destroy(Request $request, Shelf $shelf)
    {
        $this->authorizeShelf($request, $shelf);

        $shelf->delete();

        return response()->json(['message' => 'Étagère supprimée']);
    }

    public function attachBook(Request $request, Shelf $shelf, Book $book)
    {
        $this->authorizeShelf($request, $shelf);

        $shelf->books()->syncWithoutDetaching([$book->id]);

        return response()->json(['message' => 'Livre ajouté à l\'étagère']);
    }

    public function detachBook(Request $request, Shelf $shelf, Book $book)
    {
        $this->authorizeShelf($request, $shelf);

        $shelf->books()->detach($book->id);

        return response()->json(['message' => 'Livre retiré de l\'étagère']);
    }

    private function authorizeShelf(Request $request, Shelf $shelf)
    {
        if ($shelf->user_id !== $request->user()->id) {
            abort(403, 'Accès interdit à cette étagère.');
        }
    }
}
