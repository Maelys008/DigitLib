<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        // ✅ Changement : 'lu' → 'read'
        $notification->update(['status' => 'read']);

        return response()->json([
            'message' => 'Notification marquée comme lue.',
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        // ✅ Changement : 'non lu' → 'unread'
        $request->user()->notifications()
            ->where('status', 'unread')
            ->update(['status' => 'read']);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }
}