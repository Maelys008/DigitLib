<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Internal_member extends Model
{
    protected $fillable =
        [
            'user_id',
            'library_id',
        ];

    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // public function role_assignments()
    // {
    //     return $this->hasMany(Role_assignment::class);
    // }

    
}
