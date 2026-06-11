<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     **/
    protected $fillable = [
        'name',
        'email',
        'tel',
        'score',
        'password',
        'identity_hash',
        'email_verified_at',
        'status',
        'badge_id',
        'otp_code',
        'otp_expires_at',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'password' => 'hashed',
            'identity_hash' => 'hashed',
        ];
    }

    // ========== RELATIONS ==========
    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function penalties()
    {
        return $this->hasMany(Penalty::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function contestations()
    {
        return $this->hasMany(Contestation::class);
    }

    public function badge()
    {
        return $this->belongsTo(Badge::class, 'badge_id');
    }

    // Bibliothèques dont l'utilisateur est admin (propriétaire)
    public function managedLibraries()
    {
        return $this->hasMany(Library::class, 'administrator_id');
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user')
            ->withPivot('library_id')
            ->withTimestamps();
    }

    public function internalMembers()
    {
        return $this->hasMany(Internal_member::class, 'user_id');
    }

     // Clubs
    public function ownerClubs()
    {
        return $this->hasMany(Club::class);
    }

    public function memberships()
    {
        return $this->hasMany(Club_member::class);
    }

        // Social
    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }

     // Reviews
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function likedReviews()
    {
        return $this->belongsToMany(Review::class, 'review_likes')->withTimestamps();
    }

    // Favoris
    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoriteBooks()
    {
        return $this->belongsToMany(Book::class, 'favorites')
            ->withTimestamps();
    }
 // Étagères
    public function shelves()
    {
        return $this->hasMany(Shelf::class);
    }

    // ========== MÉTHODES UTILITAIRES ==========
    
    /**
     * Vérifie si l'utilisateur a un rôle spécifique dans une bibliothèque
     */
    public function hasRoleInLibrary($roleName, $libraryId)
    {
        return $this->roles()
            ->where('role_user.library_id', $libraryId)
            ->where('name_role', $roleName)
            ->exists();
    }

    /**
     * Vérifie si l'utilisateur est admin (propriétaire) d'une bibliothèque
     */
    public function isLibraryAdmin($libraryId)
    {
        return $this->managedLibraries()->where('id', $libraryId)->exists();
    }

    /**
     * Vérifie si l'utilisateur est staff (interne) d'une bibliothèque
     * (a un rôle assigné ou est admin)
     */
    public function isLibraryStaff($libraryId)
    {
        if ($this->isLibraryAdmin($libraryId)) {
            return true;
        }
        
        return $this->roles()
            ->where('role_user.library_id', $libraryId)
            ->exists();
    }

    /**
     * Récupère tous les rôles de l'utilisateur dans une bibliothèque
     */
    public function getRolesInLibrary($libraryId)
    {
        return $this->roles()
            ->where('role_user.library_id', $libraryId)
            ->get();
    }

    /**
     * Attribue un rôle à l'utilisateur dans une bibliothèque
     */
    public function assignRoleToLibrary($roleId, $libraryId)
    {
        $exists = $this->roles()
            ->where('role_user.library_id', $libraryId)
            ->where('role_user.role_id', $roleId)
            ->exists();
            
        if (!$exists) {
            $this->roles()->attach($roleId, ['library_id' => $libraryId]);
        }
        
        return $this;
    }

    /**
     * Supprime un rôle de l'utilisateur dans une bibliothèque
     */
    public function removeRoleFromLibrary($roleId, $libraryId)
    {
        $this->roles()
            ->where('role_user.library_id', $libraryId)
            ->where('role_user.role_id', $roleId)
            ->detach();
            
        return $this;
    }

}
