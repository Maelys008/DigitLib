<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    public function user(){
        return $this->belongsTo(User::class);
    }

    public function copy(){
        return $this->belongsTo(Copy::class);
    }
    public function penalities(){
        return $this->hasMany(Penality::class);
    }
}
