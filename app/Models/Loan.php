<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    protected $fillable =
        [
            'user_id',
            'copy_id',
            'loan_date',
            'expected_return_date',
            'actual_return_date',
            'condition_on_return',
        ];

    protected $casts = [
        'loan_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
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
}
