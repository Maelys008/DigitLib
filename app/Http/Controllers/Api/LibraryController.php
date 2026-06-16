<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Internal_member;
use App\Models\Library;
use App\Models\Loan;
use App\Models\Penalty;
use App\Models\User;
use App\Notifications\LibraryCreationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class LibraryController extends Controller
{
    public function index()
    {
        $user = auth('sanctum')->user();
        // Ne montrer que les bibliothèques approuvées
        $libraries = Library::where('status', 'approved')->withCount('books')->get();

        foreach ($libraries as $library) {
            $library->is_member = true;
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
        // Seul un Super Admin peut voir une bibliothèque non approuvée
        $user = auth('sanctum')->user();
        if ($library->status !== 'approved' && (! $user || ! $user->is_super_admin)) {
            return response()->json(['message' => 'Bibliothèque non trouvée.'], 404);
        }
        $library->load([
            'administrator:id,name',
            'parent:id,name',
            'internalMembers.user:id,name',
        ]);

        $response = $library->toArray();
        $response['is_member'] = true;

        return response()->json($response);
    }

    public function update(Request $request, Library $library)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'adress' => 'sometimes|required|string',
            'library_phone' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:libraries,id',
            'library_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',
            'loan_duration' => 'sometimes|integer|min:1',
            'daily_penalty_amount' => 'sometimes|numeric|min:0',
        ]);

        $data = $request->only('name', 'adress', 'library_phone', 'description', 'parent_id', 'loan_duration', 'daily_penalty_amount');

        if ($request->hasFile('library_image')) {
            if ($library->library_image) {
                Storage::disk('public')->delete($library->library_image);
            }
            $data['library_image'] = $request->file('library_image')->store('library_images', 'public');
        }

        $library->update($data);

        return response()->json(['message' => 'Bibliothèque mise à jour avec succès.', 'library' => $library]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'adress' => 'required|string',
            'library_phone' => 'required|string',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:libraries,id',
            'library_image' => 'image|mimes:jpg,jpeg,png|max:2048|nullable',
            'loan_duration' => 'nullable|integer|min:1',
            'daily_penalty_amount' => 'nullable|numeric|min:0',
            // 'status' => 'pending',
        ]);

        $exists = Library::where('name', $request->name)->where('adress', $request->adress)->exists();
        if ($exists) {
            return response()->json(['message' => 'Cette bibliothèque existe déjà.'], 422);
        }

        $imagePath = $request->hasFile('library_image')
            ? $request->file('library_image')->store('library_images', 'public')
            : null;

        return DB::transaction(function () use ($request, $imagePath) {
            $user = $request->user();

            $library = Library::create([
                'name' => $request->name,
                'library_image' => $imagePath,
                'parent_id' => $request->parent_id,
                'adress' => $request->adress,
                'library_phone' => $request->library_phone,
                'description' => $request->description,
                'administrator_id' => $user->id,
                'loan_duration' => $request->loan_duration ?? 14,
                'daily_penalty_amount' => $request->daily_penalty_amount ?? 0,
                'status' => 'pending',
            ]);

            // $user->update(['role' => 'admin']);

            // $member = Internal_member::create([
            //     'user_id'    => $user->id,
            //     'library_id' => $library->id,
            // ]);

            // Role_assignment::create([
            //     'internal_member_id' => $member->id,
            //     'role_id'            => 1,
            //     'date_assignment'    => now(),
            // ]);
            $user->assignRoleToLibrary(2, $library->id); // 2 = id du rôle Administrateur biblio

            $superAdmins = User::where('is_super_admin', true)->get();
            foreach ($superAdmins as $superAdmin) {
                $superAdmin->notify(new LibraryCreationRequest($library));
            }

            return response()->json(['message' => 'Demande de création envoyée. En attente d\'approbation par un Super Administrateur.', 'library' => $library], 201);
        });
    }

    public function userLibraries(Request $request)
    {
        $user = $request->user();

        $adminIds = Library::where('administrator_id', $user->id)->pluck('id')->toArray();
        $roleLibraryIds = $user->roles()->distinct()->pluck('role_user.library_id')->toArray();
        $allIds = array_unique(array_merge($adminIds, $roleLibraryIds));

        $libraries = Library::whereIn('id', $allIds)->get()->map(function ($library) use ($user, $adminIds) {
            $library->is_admin = in_array($library->id, $adminIds);
            $library->roles = $user->getRolesInLibrary($library->id);
            $library->is_staff = $library->is_admin || $library->roles->isNotEmpty();

            return $library;
        });

        return response()->json($libraries);
    }

    public function loans($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();

        $isAuthorized = $library->administrator_id === $user->id
            || Internal_member::where('user_id', $user->id)->where('library_id', $libraryId)->exists();

        if (! $isAuthorized) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $loans = Loan::whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->with(['user', 'copy.book'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($loans);
    }

    // File d'attente (loans avec status = réservée)
    public function waitlist($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();

        $isAuthorized = $library->administrator_id === $user->id
            || Internal_member::where('user_id', $user->id)->where('library_id', $libraryId)->exists();

        if (! $isAuthorized) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $waitlist = Loan::whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->where('status', Loan::STATUS_RESERVED)
            ->with(['user', 'copy.book'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['count' => $waitlist->count(), 'waitlist' => $waitlist]);
    }

    public function pendingPickups($libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = auth('sanctum')->user();

        $isAuthorized = $library->administrator_id === $user->id
            || Internal_member::where('user_id', $user->id)->where('library_id', $libraryId)->exists();

        if (! $isAuthorized) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $en_attente = Loan::whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->where('status', Loan::STATUS_PENDING_PICKUP)
            ->with(['user', 'copy.book'])
            ->orderBy('pickup_deadline', 'asc')
            ->get();

        return response()->json($en_attente);
    }

    public function destroy(Library $library)
    {
        if ($library->books()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer : cette bibliothèque contient encore des livres.'], 422);
        }

        if ($library->library_image) {
            Storage::disk('public')->delete($library->library_image);
        }

        $library->delete();

        return response()->json(['message' => 'Bibliothèque supprimée avec succès.']);
    }

    public function reportsStats(Request $request, $libraryId)
    {
        $library = Library::findOrFail($libraryId);
        $user = $request->user();

        if ($library->administrator_id !== $user->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $books = Book::where('library_id', $libraryId)->get();
        $activeLoans = Loan::whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->whereIn('status', [Loan::STATUS_IN_PROGRESS, Loan::STATUS_PENDING_PICKUP])
            ->count();
        $waitlistCount = Loan::whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->where('status', Loan::STATUS_RESERVED)
            ->count();
        $lateReturns = Loan::whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->where('status', Loan::STATUS_IN_PROGRESS)
            ->where('expected_return_date', '<', now())
            ->count();
        $unpaidPenalties = Penalty::whereHas('loan.copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->where('status', 'non_payé')
            ->sum('amount');

        return response()->json([
            'totalBooks' => $books->count(),
            'totalCopies' => $books->sum('nb_copy'),
            'disponible' => $books->sum('nb_available'),
            'emprunté' => $activeLoans,
            'waitlist' => $waitlistCount,
            'lateReturns' => $lateReturns,
            'totalPenalties' => $unpaidPenalties,
        ]);
    }

    public function topBooks(Request $request, $libraryId)
    {
        Library::findOrFail($libraryId);
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
        Library::findOrFail($libraryId);
        $limit = $request->get('limit', 5);

        $topUsers = Loan::select('users.id', 'users.name', DB::raw('count(*) as total'))
            ->join('users', 'loans.user_id', '=', 'users.id')
            ->whereHas('copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->groupBy('users.id', 'users.name')
            ->orderBy('total', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($topUsers);
    }

    public function genreDistribution($libraryId)
    {
        Library::findOrFail($libraryId);

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
        Library::findOrFail($libraryId);

        $penalties = Penalty::whereHas('loan.copy.book', fn ($q) => $q->where('library_id', $libraryId))
            ->where('status', 'non_payé')
            ->with(['user:id,name', 'loan.copy.book:id,title'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'user_name' => $p->user->name,
                'book_title' => $p->loan->copy->book->title,
                'amount' => $p->amount,
                'reason' => $p->reason,
            ]);

        return response()->json($penalties);
    }

    public function childrenLibraries()
    {
        $libraries = Library::whereNotNull('parent_id')
            ->withCount('books')
            ->get()
            ->map(function ($library) {
                $library->is_member = true;

                return $library;
            });

        return response()->json($libraries);
    }
}
