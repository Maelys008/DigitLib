<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club_member extends Model
{
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
