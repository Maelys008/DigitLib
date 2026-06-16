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

    public function toArray($notifiable): array
    {
        return [
            'type' => 'library_creation_request',
            'title' => 'Nouvelle demande de création de bibliothèque',
            'message' => "{$this->library->name} demande à être créée.",
            'library_id' => $this->library->id,
            'library_name' => $this->library->name,
        ];
    }
}