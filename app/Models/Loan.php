<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    // Statuts possibles
    const STATUS_PENDING_PICKUP = 'pending_pickup'; // exemplaire dispo, attente retrait 24h
    const STATUS_IN_PROGRESS    = 'in_progress';    // retiré, emprunt actif
    const STATUS_RETURNED       = 'returned';        // retourné
    const STATUS_CANCELLED      = 'cancelled';       // annulé avant retrait
    const STATUS_EXPIRED        = 'expired';         // non retiré dans les 24h
    const STATUS_RESERVED       = 'reserved';        // file d'attente (exemplaire indispo)

    protected $fillable = [
        'user_id',
        'copy_id',
        'status',
        'pickup_deadline',
        'loan_date',
        'expected_return_date',
        'actual_return_date',
        'returned_by',
        'condition_on_return',
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

    public function penalty()
    {
        return $this->hasOne(Penalty::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }
}
