<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Club_member extends Model
{
    protected $fillable =
        [
            'user_id',
            'club_id',
            'date_joined',
        ];

    protected $casts = [
        'date_joined' => 'date',
    ];

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
