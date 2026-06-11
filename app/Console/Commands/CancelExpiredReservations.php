<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Anciennement : annulation des Reservation expirées.
 * Désormais : les "réservations en file d'attente" sont des Loan avec status = réservée.
 * Ce script n'a plus de logique à exécuter car les loans réservée n'ont pas de deadline —
 * ils restent en file jusqu'à ce qu'un exemplaire soit disponible.
 * La commande est conservée pour compatibilité mais ne fait rien.
 */
class CancelExpiredReservations extends Command
{
    protected $signature = 'reservations:cancel-expired';

    protected $description = '[Obsolète] La file d\'attente est gérée via loans (status=réservée). Aucune action nécessaire.';

    public function handle()
    {
        $this->info('Les réservations en file d\'attente sont désormais des Loan (status=réservée) sans expiration automatique.');
        $this->info('Aucune action nécessaire.');
        return 0;
    }
}
