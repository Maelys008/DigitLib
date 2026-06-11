<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    // Statuts possibles
    const STATUS_PENDING_PICKUP = 'en_attente_de_retrait';
    const STATUS_IN_PROGRESS    = 'en_cours';
    const STATUS_RETURNED       = 'retourné';
    const STATUS_CANCELLED      = 'annulé';
    const STATUS_EXPIRED        = 'expiré';
    const STATUS_RESERVED       = 'réservée';

    protected $fillable = [
        'user_id',
        'copy_id',
        'status',
        'pickup_deadline',
        'loan_date',
        'expected_return_date',
        'actual_return_date',
        'returned_by',
        'return_copy_state_id',
    ];

    protected $casts = [
        'pickup_deadline'      => 'datetime',
        'loan_date'            => 'date',
        'expected_return_date' => 'date',
        'actual_return_date'   => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function copy()
    {
        return $this->belongsTo(Copy::class);
    }

    public function returnedBy()
    {
        return $this->belongsTo(User::class, 'returned_by');
    }

    public function returnCopyState()
    {
        return $this->belongsTo(CopyState::class, 'return_copy_state_id');
    }

    public function penalty()
    {
        return $this->hasOne(Penalty::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }
}