<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    protected $fillable = [
        'user_id',
        'returned_by',
        'copy_id',
        'loan_date',
        'expected_return_date',
        'actual_return_date',
        'condition_on_return',
        'status',
        'pickup_deadline',
    ];

    protected $casts = [
        'loan_date'            => 'date',
        'expected_return_date' => 'date',
        'actual_return_date'   => 'date',
        'pickup_deadline'      => 'datetime',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function copy()
    {
        return $this->belongsTo(Copy::class);
    }

    public function penalty()
    {
        return $this->hasOne(Penalty::class);
    }

    public function library()
    {
        return $this->copy->book->library();
    }

    public function book()
    {
        return $this->copy->book();
    }
}
