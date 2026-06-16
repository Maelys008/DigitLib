<?php

namespace App\Notifications;

use App\Models\Library;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LibraryDeletedBySuperAdmin extends Notification
{
    use Queueable;

    protected string $libraryName;
    protected string $reason;

    public function __construct(string $libraryName, string $reason)
    {
        $this->libraryName = $libraryName;
        $this->reason = $reason;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'library_deleted_by_super_admin',
            'title' => 'Votre bibliothèque a été supprimée',
            'message' => "La bibliothèque \"{$this->libraryName}\" a été supprimée par un Super Administrateur. Raison : {$this->reason}",
        ];
    }
}