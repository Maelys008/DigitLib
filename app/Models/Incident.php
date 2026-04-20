<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $fillable = [
        'user_id',
        'library_id',
        'loan_id', 
        'description',
        'date',
        'title',                    
        'severity',                 
        'status',                   
        'is_library_record',        
        'notify_all_librarians',    
        'related_incident_id',      
        'created_by',               
        'resolved_by',              
        'resolved_at',              
    ];

    protected $casts = [
        'date' => 'date',
        'resolved_at' => 'datetime',
        'is_library_record' => 'boolean',
        'notify_all_librarians' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function contestations()
    {
        return $this->hasMany(Contestation::class);
    }

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }
    
    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    public function relatedIncident()
    {
        return $this->belongsTo(Incident::class, 'related_incident_id');
    }
}