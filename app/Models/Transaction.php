<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    

     protected $fillable = [
        'user_id',           
        'penalty_id',        
        'reference',
        'provider',
        'external_id',
        'amount',
        'currency',
        'status',
        'payment_method',    
        'metadata',          
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',  
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function penalty()
    {
        return $this->belongsTo(Penalty::class);
    }

    // Scopes
    public function scopeSuccess($query)
    {
        return $query->where('status', 'success');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByProvider($query, $provider)
    {
        return $query->where('provider', $provider);
    }
}
