<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role_assignment extends Model
{
    protected $fillable =
    [
        'internal_member_id',
        'role_id',
        'date_assignment',
    ];

    protected $casts =
    [
        'date_assignment' => 'date',
    ];

    public function internalMember()
    {
        return $this->belongsTo(Internal_member::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
