<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shelf extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'shelf_image',
    ];

     protected $appends = ['shelf_url'];

    public function getShelfUrlAttribute()
    {
        return $this->shelf_image ? asset('storage/'.$this->shelf_image) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function books()
    {
        return $this->belongsToMany(Book::class, 'shelf_books')
            ->withTimestamps();
    }
}
