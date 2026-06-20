<?php

namespace App\Notifications;

use App\Models\Library;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LibraryCreationRequest extends Notification
{
    use Queueable;

    public function __construct(public Library $library)
    {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     * Cette méthode est utilisée par le canal 'database'
     */
    public function toArray($notifiable): array
    {
        return [
            'title' => 'Nouvelle demande de création de bibliothèque',
            'message' => "{$this->library->name} demande à être créée.",
            'library_id' => $this->library->id,
            'library_name' => $this->library->name,
        ];
    }

    /**
     * Get the notification's database type.
     */
    public function databaseType($notifiable): string
    {
        return 'library_creation_request';
    }
}