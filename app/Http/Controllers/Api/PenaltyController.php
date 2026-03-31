<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penalty;
use Illuminate\Http\Request;

class PenaltyController extends Controller
{
    
public function payPenalty($penaltyId)
{
    $penalty = Penalty::findOrFail($penaltyId);
    
    $penalty->update([
        'status' => 'payé'
    ]);

    return response()->json(['message' => 'Pénalité réglée avec succès.']);
}
}
