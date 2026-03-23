<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Copy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Book::with('library');

        // if ($request->has('title')) {
        //     $query->where('title', 'like', '%' . $request->title . '%');
        // }

        // if ($request->has('author')) {
        //     $query->where('author', 'like', '%' . $request->author . '%');
        // }

        // if ($request->has('genre')) {
        //     $query->where('genre', 'like', '%' . $request->genre . '%');
        // }

        // if ($request->has('library_id')) {
        //     $query->where('library_id', 'like', '%' . $request->library_id . '%');
        // }

        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('author', 'like', $searchTerm)
                    ->orWhere('genre', 'like', $searchTerm);
            });
        }

        if ($request->has('library_id')) {
            $query->where('library_id', $request->library_id);  // Pas de LIKE pour ID numérique
        }

        if ($request->has('year_of_publication')) {
            $query->where('year_of_publication', $request->year_of_publication);
        }

        if ($request->has('only_available') && $request->only_available == 'true') {
            $query->where('nb_available', '>', 0);
        }


        //Tri 
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        //pargination
        $perPage = $request->input('per_page', 10);
        $books = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $books
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'genre' => 'required|string',
            'isbn' => 'required|string',
            'description' => 'required|string',
            'year_of_publication' => 'required|date',
            'cover_image' => 'image|mimes:jpg,jpeg,png|max:2048',
            'library_id' => 'required|exists:libraries,id',
            'nb_available' => 'required|integer|min:0',
            'nb_copy' => 'required|integer|min:0',
        ]);
        $isbnExists = Book::where('isbn', $request->isbn)->exists();
        if ($isbnExists) {
            return response()->json([
                'message' => 'Un livre avec cet ISBN existe déjà.'
            ], 422);
        }


        $data = $request->all();

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $data['cover_image'] = $path;
        }

        $data['nb_available'] = $data['nb_copy'];
        $book = Book::create($data);
        $this->generateCopies($book, $data['nb_copy']);
        return response()->json([
            'message' => 'Livre ajouté',
            'data' => $book
        ], 201);
    }
    private function generateCopies(Book $book, int $count)
    {
        $newCopies = [];
        for ($i = 0; $i < $count; $i++) {
            $newCopies[] = [
                'book_id'    => $book->id,
                'codeQR'     => 'QR-' . strtoupper(Str::random(8)),
                'book_status' => 'neuf',
                'status'     => 'disponible',
                'date_added' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Copy::insert($newCopies);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $book = Book::with(['library', 'copies'])->find($id);

        if (! $book) {
            return response()->json([
                'message' => 'Book not found'
            ], 404);
        }
        return response()->json($book, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $book = Book::find($id);


        if (!$book) {
            return response()->json([
                'message' => 'Livre non trouvé'
            ], 404);
        }
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'genre' => 'sometimes|string',
            'description' => 'sometimes|string',
            'nb_copy' => 'sometimes|integer|min:0',
            'cover_image' => 'image|mimes:jpg,jpeg,png|max:2048',
        ]);


        $data = $request->all();

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image) {
                Storage::disk('public')->delete($book->cover_image);
            }

            $path = $request->file('cover_image')->store('covers', 'public');
            $data['cover_image'] = $path;
        }
        $book->update($data);

        return response()->json([
            'message' => 'Livre mis à jour',
            'data' => $book
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['message' => 'Livre non trouvé'], 404);
        }


        $hasActiveLoans = $book->copies()->where('status', 'emprunté')->exists();

        if ($hasActiveLoans) {
            return response()->json([
                'message' => 'Impossible de supprimer ce livre car des exemplaires sont actuellement entre les mains d\'abonnés.'
            ], 422);
        }

        $book->copies()->delete();
        $book->delete();

        return response()->json([
            'message' => 'Le livre et ses exemplaires ont été retirés du catalogue.'
        ], 200);
    }
}
