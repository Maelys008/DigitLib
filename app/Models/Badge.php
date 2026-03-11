<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $fillable =
    [
        'name',
        'condition_of_obtaining',
        'maximum_book',
    ];
    
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
