<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $fillable =
        [
            'user_id',
            'library_id',
            'loan_id', 
            'description',
            'date',
        ];

    protected $casts = [
        'date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function contestations()
    {
        return $this->hasMany(Contestation::class);
    }

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }
}
