<?php

namespace App\Notifications;

use App\Models\Library;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LibraryRequestProcessed extends Notification
{
    use Queueable;

    public function __construct(public Library $library, public string $status, public ?string $reason = null)
    {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        $statusText = $this->status === 'approved' ? 'approuvée' : 'rejetée';
        $message = "Votre demande de création de bibliothèque \"{$this->library->name}\" a été {$statusText}.";

        if ($this->reason) {
            $message .= " Raison : {$this->reason}";
        }

        return [
            'title' => 'Demande de bibliothèque ' . $statusText,
            'message' => $message,
            'library_id' => $this->library->id,
        ];
    }

    public function databaseType($notifiable): string
    {
        return 'library_request_' . $this->status;
    }
}