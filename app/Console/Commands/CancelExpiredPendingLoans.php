<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredPendingLoans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loans:cancel-expired-pending';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Annuler les prêts en attente de retrait depuis plus de 24h';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();

        $loans = Loan::with(['copy.book', 'user'])
            ->where('status', 'pending_pickup')
            ->where('pickup_deadline', '<', $now)
            ->get();

        foreach ($loans as $loan) {
            DB::transaction(function () use ($loan, $now) {
                $loan->update([
                    'status' => 'cancelled',
                ]);

                // Libérer l’exemplaire
                $copy = $loan->copy;
                $book = $copy->book;

                $copy->update(['status' => 'disponible']);
                $book->increment('nb_available');

                // Notifier l'utilisateur
                Notification::create([
                    'user_id' => $loan->user_id,
                    'type' => 'loan_cancelled',
                    'message' => "Votre emprunt pour le livre '{$book->title}' a été annulé faute de retrait dans les 24h.",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => $now,
                ]);
            });
        }

        return 0;
    }
}
