<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{

protected $fillable =
    [
        'name_role',
        'permissions',
        
    ];
    
    public function role_assignments()
    {
        return $this->hasMany(Role_assignment::class);
    }
}
