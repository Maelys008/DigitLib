<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{

    protected $fillable =
    [
        'library_id',
        'title',
        'author',
        'genre',
        'isbn',
        'description',
        'year_of_publication',
        'nb_copy', 
        'nb_available'
    ];

    
    protected $casts =
    [
        'year_of_publication' => 'date'
    ];


    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function copies()
    {
        return $this->hasMany(Copy::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
