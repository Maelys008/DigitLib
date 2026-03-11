<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Penality extends Model
{
     public function user()
    {
        return $this->belongsTo(User::class);
    }

     public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

}
