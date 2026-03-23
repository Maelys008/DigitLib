<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penality;
use Illuminate\Http\Request;

class PenalityController extends Controller
{
    
public function payPenalty($penaltyId)
{
    $penalty = Penality::findOrFail($penaltyId);
    
    $penalty->update([
        'status' => 'payé'
    ]);

    return response()->json(['message' => 'Pénalité réglée avec succès.']);
}
}
