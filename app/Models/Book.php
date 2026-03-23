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
        'nb_available',
        'cover_image',
    ];


    protected $casts =
    [
        'year_of_publication' => 'date'
    ];
    protected $appends = ['cover_url'];

    public function getCoverUrlAttribute()
    {
        return $this->cover_image ? asset('storage/' . $this->cover_image) : null;
    }
    


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
