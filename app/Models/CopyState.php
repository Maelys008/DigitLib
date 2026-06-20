<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CopyState extends Model
{
    protected $fillable = ['libelle_state', 'color'];

    public function copies()
    {
        return $this->hasMany(Copy::class);
    }

    public function returnLoans()
    {
        return $this->hasMany(Loan::class, 'return_copy_state_id');
    }

    // Helper pour les badges
    public function getBadgeColorClass()
    {
        return match($this->color) {
            'green' => 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'blue' => 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
            'orange' => 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
            'red' => 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            default => 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
    }
}