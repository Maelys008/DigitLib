<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{


    protected $fillable = [
        'user_id',
        'type',
        'message',
        'object_type',
        'object',
        'status',
        'date_sent'
    ];

    protected $casts = [
        'date_sent' => 'datetime',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
