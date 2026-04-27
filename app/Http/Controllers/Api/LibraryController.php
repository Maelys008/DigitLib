<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Inscription;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\Loan;
use App\Models\Penalty;
use App\Models\Reservation;
use App\Models\Role_assignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LibraryController extends Controller
{
    public function index()
    {
        $user = auth('sanctum')->user();
        $libraries = Library::all();
        foreach ($libraries as $library) {
            $library->books_count = $library->books()->count();
            $library->members_count = $library->inscriptions()->count();

            $library->isjoined = $user
                ? $library->inscriptions()->where('user_id', $user->id)->exists()
                : false;
        }

        return response()->json($libraries);
    }

    public function myManagedLibraries()
    {
        $user = auth('sanctum')->user();

        return Library::where('administrator_id', $user->id)->get();
    }
public function show(Library $library)
{
    $user = auth('sanctum')->user();
    
    // Vérifier si l'utilisateur est membre de cette bibliothèque
    $isMember = false;
    if ($user) {
        $isMember = Inscription::where('user_id', $user->id)
            ->where('library_id', $library->id)
            ->exists();
    }
    
    $library->load([
        'administrator:id,name',
        'parent:id,name',
        'internalMembers.user:id,name',
    ]);
    
    $response = $library->toArray();
    $response['is_member'] = $isMember;
    
    return response()->json($response);
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

        $data = $request->only('name', 'adress', 'description', 'parent_id');

        if ($request->has('loan_duration')) {
            $data['loan_duration'] = $request->loan_duration;
        }
        if ($request->has('daily_penalty_amount')) {
            $data['daily_penalty_amount'] = $request->daily_penalty_amount;
        }

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
        ]);

        $user = $request->user();

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

        $imagePath = null;
        if ($request->hasFile('library_image')) {
            $imagePath = $request->file('library_image')->store('library_images', 'public');
        }

        $exists = Library::where('name', $request->name)
            ->where('adress', $request->adress)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Cette bibliothèque existe déjà.'], 422);
        }

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

    public function userLibraries(Request $request)
    {
        $user = $request->user();
        
        $adminIds = Library::where('administrator_id', $user->id)->pluck('id')->toArray();
        $internalIds = Internal_member::where('user_id', $user->id)->pluck('library_id')->toArray();
        $allIds = array_unique(array_merge($adminIds, $internalIds));
        
        $libraries = Library::whereIn('id', $allIds)->get();
        
        $result = $libraries->map(function ($library) use ($adminIds, $internalIds) {
            $library->is_admin = in_array($library->id, $adminIds);
            $library->is_member_internal = in_array($library->id, $internalIds);
            return $library;
        });
        
        return response()->json($result);
    }

    public function reservations($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();
        
        $isAdmin = $library->administrator_id === $user->id;
        $isStaff = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();
        
        if (!$isAdmin && !$isStaff) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        $allReservations = Reservation::whereHas('book', function ($query) use ($libraryId) {
            $query->where('library_id', $libraryId);
        })
        ->with(['user', 'book'])
        ->orderBy('created_at', 'asc')
        ->get();

        $activeCount = $allReservations->where('status', 'active')->count();
        $notifiedCount = $allReservations->where('status', 'notified')->count();

        return response()->json([
            'count' => $activeCount + $notifiedCount,
            'active_count' => $activeCount,
            'notified_count' => $notifiedCount,
            'reservations' => $allReservations,
        ]);
    }

    public function loans($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();
        
        $isAdmin = $library->administrator_id === $user->id;
        $isStaff = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();
        
        if (!$isAdmin && !$isStaff) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $loans = Loan::whereHas('copy.book', function ($query) use ($libraryId) {
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

    public function reportsStats(Request $request, $libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = $request->user();
        
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé - Réservé aux administrateurs'], 403);
        }

        $books = Book::where('library_id', $libraryId)->get();
        $totalCopies = $books->sum('nb_copy');
        $totalAvailable = $books->sum('nb_available');
        $totalBooks = $books->count();

        $activeLoans = Loan::whereHas('copy.book', function ($q) use ($libraryId) {
            $q->where('library_id', $libraryId);
        })->whereNull('actual_return_date')->count();

        $membersCount = Inscription::where('library_id', $libraryId)->count();

        $reservationsCount = Reservation::whereHas('book', function ($q) use ($libraryId) {
            $q->where('library_id', $libraryId);
        })->whereIn('status', ['active', 'notified'])->count();

        $lateReturns = Loan::whereHas('copy.book', function ($q) use ($libraryId) {
            $q->where('library_id', $libraryId);
        })->whereNull('actual_return_date')
            ->where('expected_return_date', '<', now())
            ->count();

        $totalUnpaidPenalties = Penalty::whereHas('loan.copy.book', function ($q) use ($libraryId) {
            $q->where('library_id', $libraryId);
        })->where('status', 'non payé')->sum('amount');

        return response()->json([
            'totalBooks' => $totalBooks,
            'totalCopies' => $totalCopies,
            'available' => $totalAvailable,
            'borrowed' => $activeLoans,
            'users' => $membersCount,
            'reservations' => $reservationsCount,
            'lateReturns' => $lateReturns,
            'totalPenalties' => $totalUnpaidPenalties,
        ]);
    }

    public function activeReservations($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();
        
        $isAdmin = $library->administrator_id === $user->id;
        $isStaff = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();
        
        if (!$isAdmin && !$isStaff) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $reservations = Reservation::whereHas('book', function ($query) use ($libraryId) {
            $query->where('library_id', $libraryId);
        })
        ->where('status', 'active')
        ->with(['user', 'book'])
        ->orderBy('created_at', 'asc')
        ->get();

        return response()->json([
            'count' => $reservations->count(),
            'reservations' => $reservations,
        ]);
    }

    public function pendingPickups($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();
        
        $isAdmin = $library->administrator_id === $user->id;
        $isStaff = Internal_member::where('user_id', $user->id)
            ->where('library_id', $libraryId)
            ->exists();
        
        if (!$isAdmin && !$isStaff) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $pendingPickups = Loan::whereHas('copy.book', function ($query) use ($libraryId) {
            $query->where('library_id', $libraryId);
        })
        ->where('status', 'pending_pickup')
        ->with(['user', 'copy.book'])
        ->orderBy('pickup_deadline', 'asc')
        ->get();

        return response()->json($pendingPickups);
    }

    public function topBooks(Request $request, $libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = $request->user();
        
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé - Réservé aux administrateurs'], 403);
        }

        $limit = $request->get('limit', 5);

        $topBooks = Loan::select('books.id', 'books.title', 'books.author', DB::raw('count(*) as total'))
            ->join('copies', 'loans.copy_id', '=', 'copies.id')
            ->join('books', 'copies.book_id', '=', 'books.id')
            ->where('books.library_id', $libraryId)
            ->groupBy('books.id', 'books.title', 'books.author')
            ->orderBy('total', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($topBooks);
    }

    public function topUsers(Request $request, $libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = $request->user();
        
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé - Réservé aux administrateurs'], 403);
        }

        $limit = $request->get('limit', 5);

        $topUsers = Loan::select('users.id', 'users.name', DB::raw('count(*) as total'))
            ->join('users', 'loans.user_id', '=', 'users.id')
            ->whereHas('copy.book', function ($q) use ($libraryId) {
                $q->where('library_id', $libraryId);
            })
            ->groupBy('users.id', 'users.name')
            ->orderBy('total', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($topUsers);
    }

    public function genreDistribution($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();
        
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé - Réservé aux administrateurs'], 403);
        }
        
        $distribution = Book::where('library_id', $libraryId)
            ->join('genres', 'books.genre_id', '=', 'genres.id')
            ->select('genres.name', DB::raw('count(*) as total'))
            ->groupBy('genres.name')
            ->orderBy('total', 'desc')
            ->get();

        return response()->json($distribution);
    }

    public function activePenalties($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();
        
        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé - Réservé aux administrateurs'], 403);
        }
        
        $penalties = Penalty::whereHas('loan.copy.book', function ($q) use ($libraryId) {
            $q->where('library_id', $libraryId);
        })
            ->where('status', 'non payé')
            ->with(['user:id,name', 'loan.copy.book:id,title'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($penalty) {
                return [
                    'id' => $penalty->id,
                    'user_name' => $penalty->user->name,
                    'book_title' => $penalty->loan->copy->book->title,
                    'amount' => $penalty->amount,
                    'reason' => $penalty->reason,
                ];
            });

        return response()->json($penalties);
    }

    public function partnerLibraries()
    {
        $user = auth('sanctum')->user();

        $libraries = Library::whereNotNull('parent_id')
            ->withCount(['books', 'inscriptions'])
            ->get();

        foreach ($libraries as $library) {
            $library->isjoined = $user
                ? $library->inscriptions()->where('user_id', $user->id)->exists()
                : false;
        }

        return response()->json($libraries);
    }

    public function childrenLibraries()
    {
        $user = auth('sanctum')->user();

        $libraries = Library::whereNotNull('parent_id')
            ->withCount(['books', 'inscriptions'])
            ->get();

        foreach ($libraries as $library) {
            $library->books_count = $library->books_count;
            $library->members_count = $library->inscriptions_count;
            $library->isjoined = $user
                ? $library->inscriptions()->where('user_id', $user->id)->exists()
                : false;
        }

        return response()->json($libraries);
    }
}