<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role_assignment extends Model
{
    public function internalMember()
    {
        return $this->belongsTo(Internal_member::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
