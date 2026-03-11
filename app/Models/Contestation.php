<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contestation extends Model
{

protected $fillable =
    [
        'user_id',
        'incident_id',
        'message',
        'justification',
        'status',
        
    ];

    
    public function user(){
        return $this->belongsTo(User::class);
    }

    public function incident(){
        return $this->belongsTo(Incident::class);
    }

    

}
