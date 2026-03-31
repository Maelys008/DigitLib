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
        'genre_id',
        'isbn',
        'description',
        'year_of_publication',
        'nb_copy',
        'nb_available',
        'cover_image',
    ];


    protected $casts =
        [
            'year_of_publication' => 'date',
        ];

    protected $appends = ['cover_url', 'average_rating'];

    public function getCoverUrlAttribute()
    {
        return $this->cover_image ? asset('storage/'.$this->cover_image) : null;
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
    public function genre()
    {
        return $this->belongsTo(Genre::class, 'genre_id');
    }
public function reviews()
{
    return $this->hasMany(Review::class);
}

    // Calcul de la moyenne des étoiles
    public function getAverageRatingAttribute()
    {
        return round($this->reviews()->avg('rating'), 1) ?: 0;
    }
}
