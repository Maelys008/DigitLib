<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Badge;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Validation\Rules\In;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
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
        'role',
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

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }


    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function penalities()
    {
        return $this->hasMany(Penality::class);
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
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

    public function managedLibraries()
    {
        return $this->hasMany(Library::class, 'administrator_id');
    }

    public function internal_members()
    {
        return $this->hasMany(Internal_member::class, 'user_id');
    }
    public function ownerClubs()
    {
        return $this->hasMany(Club::class);
    }
    public function memberships()
    {
        return $this->hasMany(Club_member::class);
    }
    public function socialAccounts()
    {
        return $this->hasMany(Social_account::class);
    }
}
