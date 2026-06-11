<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Copy extends Model
{
    // Statuts exemplaire
    const STATUS_AVAILABLE = 'disponible';
    const STATUS_RESERVED  = 'réservée';
    const STATUS_BORROWED  = 'emprunté';
    const STATUS_LOST      = 'perdue';

    protected $fillable = [
        'book_id',
        'codeQR',
        'copy_state_id',
        'status',
        'date_added',
    ];

    protected $casts = [
        'date_added' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($copy) {
            if (empty($copy->codeQR)) {
                $copy->codeQR = Str::random(64);
            }
        });
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function copyState()
    {
        return $this->belongsTo(CopyState::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function activeLoan()
    {
        return $this->hasOne(Loan::class)->whereIn('status', [
            Loan::STATUS_PENDING_PICKUP,
            Loan::STATUS_IN_PROGRESS,
        ]);
    }
}