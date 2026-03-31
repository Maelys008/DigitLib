<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Social_account extends Model
{
    protected $fillable =
        [
            'user_id',
            'provider',
            'provider_id',
            'token',
        ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
