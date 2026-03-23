<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->notifications()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->update(['status' => 'lu']);

        return response()->json([
            'message' => 'Notification marqué comme lue.'
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()
            ->where('status', 'non lu')
            ->update(['status' => 'lu']);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}
