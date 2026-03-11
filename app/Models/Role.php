<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    public function role_assignments()
    {
        return $this->hasMany(Role_assignment::class);
    }
}
