<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Copy extends Model
{
    protected $fillable = 
    [
        'book_id',
        'codeQR',
        'book_status',
        'date_added',
        'status'
    ];

    protected $casts =
    [
        'date_added' => 'date'
    ];

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }
}
