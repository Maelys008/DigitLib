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
        $query = Book::with(['library', 'genre']);

        if ($request->has('search') && ! empty($request->search)) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', $searchTerm)
                    ->orWhere('author', 'like', $searchTerm)
                    ->orWhereHas('genre', function ($subQ) use ($searchTerm) {
                        $subQ->where('name', 'like', $searchTerm);
                    });
            });
        }

        if ($request->has('library_id')) {
            $query->where('library_id', $request->library_id);
        }

        if ($request->has('year_of_publication')) {
            $query->where('year_of_publication', $request->year_of_publication);
        }

        if ($request->has('only_available') && $request->only_available == 'true') {
            $query->where('nb_available', '>', 0);
        }

        // Tri
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // pargination
        $books = $query->paginate($request->input('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $books,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */

 public function store(Request $request)
{
    \Log::info('=== STORE BOOK ===');
    \Log::info('Données reçues:', $request->all());
    
    try {
        $request->validate([
            'title' => 'required|string',
            'author' => 'required|string',
            'genre_id' => 'required|exists:genres,id',
            'isbn' => 'required|string',
            'description' => 'required|string',
            'year_of_publication' => 'required|integer|min:1000|max:' . now()->year,
            'cover_image' => 'image|mimes:jpg,jpeg,png|max:2048',
            'library_id' => 'required|exists:libraries,id',
            'nb_available' => 'required|integer|min:0',
            'nb_copy' => 'required|integer|min:0',
        ]);

        $isbnExists = Book::where('isbn', $request->isbn)
            ->where('library_id', $request->library_id)
            ->exists();
            
        if ($isbnExists) {
            return response()->json(['message' => 'Un livre avec cet ISBN existe déjà.'], 422);
        }

        $data = $request->all();

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('covers', 'public');
            $data['cover_image'] = $path;
            \Log::info('Image sauvegardée:', ['path' => $path]);
        }

        // 🔥 N'écrase PAS nb_available
        // $data['nb_available'] = $data['nb_copy'];

        \Log::info('Création du livre avec:', $data);
        
        $book = Book::create($data);
        
        \Log::info('Livre créé avec ID: ' . $book->id);
        
        $this->generateCopies($book, $data['nb_copy']);
        
        \Log::info('Copies générées');

        return response()->json(['message' => 'Livre ajouté', 'data' => $book], 201);
        
    } catch (\Exception $e) {
        \Log::error('ERREUR STORE BOOK:', [
            'message' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile(),
            'trace' => $e->getTraceAsString()
        ]);
        return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
    }
}

    private function generateCopies(Book $book, int $count)
    {
        $newCopies = [];
        for ($i = 0; $i < $count; $i++) {
            $newCopies[] = [
                'book_id' => $book->id,
                'codeQR' => 'QR-' . strtoupper(Str::random(8)),
                'condition' => 'neuf',
                'status' => 'disponible',
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
        $book = Book::with(['library', 'copies', 'genre', 'reviews.user'])->find($id);

        if (! $book) {
            return response()->json([
                'message' => 'Book not found',
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

        if (! $book) {
            return response()->json([
                'message' => 'Livre non trouvé',
            ], 404);
        }
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'genre_id' => 'sometimes|exists:genres,id',
            'year_of_publication' => 'sometimes|integer|min:1000|max:' . now()->year,
            'description' => 'sometimes|string',
            'nb_copy' => 'sometimes|integer|min:0',
            'cover_image' => 'image|mimes:jpg,jpeg,png|max:2048',
        ]);


        $data = $request->all();

        // Logique de mise à jour du stock et des copies
        if ($request->has('nb_copy')) {
            $newTotal = (int) $request->nb_copy;
            $oldTotal = (int) $book->nb_copy;

            if ($newTotal > $oldTotal) {
                $difference = $newTotal - $oldTotal;
                $data['nb_available'] = $book->nb_available + $difference;
                $this->generateCopies($book, $difference);
            } elseif ($newTotal < $oldTotal) {
                return response()->json([
                    'message' => 'La réduction du nombre de copies doit être géré manuellement pour éviter de supprimer des livres empruntés.'
                ], 422);
            }
        }

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
            'data' => $book->fresh(),
        ]);
    }
                /**
             * Get all copies of a specific book
             */
            public function getCopies($bookId)
            {
                $book = Book::findOrFail($bookId);
                
                $copies = $book->copies()->get()->map(function($copy) {
                    return [
                        'id' => $copy->id,
                        'codeQR' => $copy->codeQR,
                        'condition' => $copy->condition,
                        'status' => $copy->status,
                        'date_added' => $copy->date_added?->format('Y-m-d'),
                    ];
                });
                
                return response()->json([
                    'book' => [
                        'id' => $book->id,
                        'title' => $book->title,
                        'author' => $book->author,
                        'cover_url' => $book->cover_image ? '/storage/' . $book->cover_image : null,
                    ],
                    'copies' => $copies,
                    'total_copies' => $copies->count(),
                ]);
            }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::find($id);

        if (! $book) {
            return response()->json(['message' => 'Livre non trouvé'], 404);
        }

        $hasActiveLoans = $book->copies()->where('status', 'emprunté')->exists();

        if ($hasActiveLoans) {
            return response()->json([
                'message' => 'Impossible de supprimer ce livre car des exemplaires sont actuellement entre les mains d\'abonnés.',
            ], 422);
        }

        $book->copies()->delete();
        $book->delete();

        return response()->json([
            'message' => 'Le livre et ses exemplaires ont été retirés du catalogue.',
        ], 200);
    }
}
