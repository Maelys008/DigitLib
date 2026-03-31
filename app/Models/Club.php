<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    protected $fillable =
        [
            'user_id',
            'name',
            'description',
        ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function members()
    {
        return $this->hasMany(Club_member::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
