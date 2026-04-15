<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Copy extends Model
{
    protected $fillable =
        [
            'book_id',
            'codeQR',
            'condition',
            'date_added',
            'status',
        ];

    protected $casts =
        [
            'date_added' => 'date',
        ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($copy) {
            // Génère un token unique de 64 caractères s'il n'est pas définis par le bookcontroller
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
}
