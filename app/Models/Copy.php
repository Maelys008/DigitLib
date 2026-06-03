<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Copy extends Model
{
    // Statuts exemplaire
    const STATUS_AVAILABLE = 'available'; // libre

    const STATUS_RESERVED = 'reserved';  // en attente retrait (pending_pickup)

    const STATUS_BORROWED = 'borrowed';  // emprunté

    const STATUS_LOST = 'lost';      // perdu (30j de retard)

    const STATUS_PENDING_PICKUP = 'pending_pickup';

    // États physiques
    const CONDITION_NEW = 'new';

    const CONDITION_GOOD = 'good';

    const CONDITION_DAMAGED = 'damaged';

    const CONDITION_VERY_DAMAGED = 'very_damaged';

    protected $fillable = [
        'book_id',
        'codeQR',
        'condition',
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

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function activeLoan()
    {
        return $this->hasOne(Loan::class)->whereIn('status', [
            Loan::STATUS_IN_PROGRESS,Loan::STATUS_PENDING_PICKUP,
        ]);
    }
}
