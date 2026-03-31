<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Library extends Model
{

    protected $fillable = [
        'name',
        'adress',
        'description',
        'parent_id',
        'administrator_id',
        'library_image',
        'loan_duration',
        'daily_penalty_amount',
    ];

    protected $appends = ['library_url','members_count'];

    public function getLibraryUrlAttribute()
    {
        return $this->library_image ? asset('storage/' . $this->library_image) : null;
    }

    public function allChildrenIds()
    {
        $ids = collect();

        foreach ($this->children as $child) {
            $ids->push($child->id);
            $ids = $ids->merge($child->allChildrenIds());
        }

        return $ids;
    }
    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function inscriptions()
    {
        return $this->hasMany(Inscription::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function administrator()
    {
        return $this->belongsTo(User::class, 'administrator_id');
    }


    public function internalMembers()
    {
        return $this->hasMany(Internal_member::class, 'library_id');
    }
    public function children()
    {
        return $this->hasMany(Library::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(Library::class, 'parent_id');
    }

    public function getMembersCountAttribute()
    {
        return $this->inscriptions()->count();
    }
}
