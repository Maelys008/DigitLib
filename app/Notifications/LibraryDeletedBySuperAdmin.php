<?php

namespace App\Notifications;

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
            'title' => 'Votre bibliothèque a été supprimée',
            'message' => "La bibliothèque \"{$this->libraryName}\" a été supprimée par un Super Administrateur. Raison : {$this->reason}",
            'library_name' => $this->libraryName,
            'reason' => $this->reason,
        ];
    }

    public function databaseType($notifiable): string
    {
        return 'library_deleted_by_super_admin';
    }
}