<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    public function creactor()
    {
        return $this->belongsTo(User::class);
    }

    // public function members()
    // {
    //     return $this->hasMany(Club_member::class);
    // }
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
