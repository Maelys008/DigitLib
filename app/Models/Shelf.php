<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shelf extends Model
{
     protected $fillable = ['user_id', 'name', 'description'];

    public function user() { return $this->belongsTo(User::class); }

    public function books()
    {
        return $this->belongsToMany(Book::class, 'shelf_books')
            ->withTimestamps();
    }
}
