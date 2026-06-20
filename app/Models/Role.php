<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable =
        [
            'name_role',
        ];

    // public function role_assignments()
    // {
    //     return $this->hasMany(Role_assignment::class);
    // }
    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user')
            ->withPivot('library_id')
            ->withTimestamps();
    }

    public function libraries()
    {
        return $this->belongsToMany(Library::class, 'role_user')
            ->withPivot('user_id')
            ->withTimestamps();
    }
}
