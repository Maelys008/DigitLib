<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Models\User;
use App\Notifications\LibraryDeletedBySuperAdmin;
use App\Notifications\LibraryRequestProcessed;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    /**
     * Liste tous les utilisateurs
     */
    public function users(Request $request)
    {
        $query = User::with(['badge', 'roles']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('tel', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name_role', $request->role);
            });
        }

        if ($request->filled('is_super_admin')) {
            $query->where('is_super_admin', $request->boolean('is_super_admin'));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 20));

        return response()->json($users);
    }

    /**
     * Liste des demandes de création de bibliothèque (status = pending)
     */
    public function libraryRequests(Request $request)
    {
        $libraries = Library::with('administrator')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($libraries);
    }

    /**
     * Approuver une demande de bibliothèque
     */
    public function approveLibraryRequest(Request $request, $id)
    {
        $library = Library::findOrFail($id);

        if ($library->status !== 'pending') {
            return response()->json(['message' => 'Cette demande a déjà été traitée.'], 422);
        }

        $library->update(['status' => 'approved']);

        // Notifier le demandeur
        $library->administrator->notify(new LibraryRequestProcessed($library, 'approved'));

        return response()->json(['message' => 'Bibliothèque approuvée avec succès.', 'library' => $library]);
    }

    /**
     * Rejeter une demande de bibliothèque avec une raison
     */
    public function rejectLibraryRequest(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $library = Library::findOrFail($id);

        if ($library->status !== 'pending') {
            return response()->json(['message' => 'Cette demande a déjà été traitée.'], 422);
        }

        $library->update(['status' => 'rejected']);

        // Notifier le demandeur avec la raison
        $library->administrator->notify(new LibraryRequestProcessed($library, 'rejected', $request->reason));

        return response()->json(['message' => 'Demande rejetée.', 'library' => $library]);
    }

    /**
     * Supprimer une bibliothèque (même si approuvée) avec notification à l'admin
     */
    public function destroyLibrary(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $library = Library::findOrFail($id);
        $admin = $library->administrator;
        $libraryName = $library->name;

        // Supprimer la bibliothèque
        $library->delete();

        // Notifier l'administrateur de la bibliothèque supprimée
        if ($admin) {
            $admin->notify(new LibraryDeletedBySuperAdmin($libraryName, $request->reason));
        }

        return response()->json(['message' => 'Bibliothèque supprimée avec succès.']);
    }

    /**
     * Dashboard stats pour Super Admin
     */
    public function dashboardStats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_libraries' => Library::count(),
            'pending_libraries' => Library::where('status', 'pending')->count(),
            'approved_libraries' => Library::where('status', 'approved')->count(),
            'rejected_libraries' => Library::where('status', 'rejected')->count(),
            'super_admins' => User::where('is_super_admin', true)->count(),
        ]);
    }

    /**
     * Ajouter un Super Admin (par email)
     */
    public function makeSuperAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user->is_super_admin) {
            return response()->json(['message' => 'Cet utilisateur est déjà Super Admin.'], 422);
        }

        $user->update(['is_super_admin' => true]);

        return response()->json(['message' => "{$user->name} est maintenant Super Administrateur."]);
    }

    /**
     * Retirer le statut Super Admin
     */
    public function removeSuperAdmin(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (! $user->is_super_admin) {
            return response()->json(['message' => "Cet utilisateur n'est pas Super Admin."], 422);
        }

        // Empêcher de se retirer soi-même (optionnel)
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas retirer votre propre statut Super Admin.'], 422);
        }

        $user->update(['is_super_admin' => false]);

        return response()->json(['message' => "Statut Super Admin retiré à {$user->name}."]);
    }
}
