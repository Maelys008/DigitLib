<?php

namespace App\Console\Commands;

use App\Models\Copy;
use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredReservations extends Command
{
    protected $signature = 'reservations:cancel-expired';

    protected $description = '[Obsolète] La file d\'attente est gérée via loans (status=reserved). Aucune action nécessaire.';

    public function handle()
    {
        $this->info('Les réservations en file d\'attente sont désormais des Loan (status=reserved) sans expiration automatique.');
        $this->info('Aucune action nécessaire.');
        return 0;
    }
}
