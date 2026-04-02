<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable =
        [
            'member_id',
            'club_id',
            'message',

        ];

    public function clubMember()
    {
        return $this->belongsTo(Club_member::class, 'member_id');
    }

    public function club()
    {
        return $this->belongsTo(Club::class, 'club_id');
    }
}
