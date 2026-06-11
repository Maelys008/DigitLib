<?php

namespace App\Console\Commands;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredPendingLoans extends Command
{
    protected $signature = 'loans:cancel-expired-pending';

    protected $description = 'Annule les prêts en attente de retrait (en_attente_de_retrait) dont la deadline 24h est dépassée';

    public function handle()
    {
        $now = now();

        $loans = Loan::with(['copy.book.library', 'user'])
            ->where('status', Loan::STATUS_PENDING_PICKUP)
            ->where('pickup_deadline', '<', $now)
            ->get();

        $count = 0;

        foreach ($loans as $loan) {
            DB::transaction(function () use ($loan, $now, &$count) {
                $copy    = $loan->copy;
                $book    = $copy->book;
                $library = $book->library;

                // Passer le loan en expiré
                $loan->update(['status' => Loan::STATUS_EXPIRED]);

                // Y a-t-il quelqu'un en file d'attente pour ce livre ?
                $nextInQueue = Loan::where('status', Loan::STATUS_RESERVED)
                    ->whereHas('copy', fn($q) => $q->where('book_id', $book->id))
                    ->orderBy('created_at', 'asc')
                    ->first();

                if ($nextInQueue) {
                    // Réassigner cet exemplaire au suivant
                    $nextInQueue->update([
                        'copy_id'              => $copy->id,
                        'status'               => Loan::STATUS_PENDING_PICKUP,
                        'pickup_deadline'      => $now->copy()->addHours(24),
                        'expected_return_date' => $now->copy()->addDays($library->loan_duration ?? 14),
                    ]);

                    $copy->update(['status' => 'réservée']);

                    Notification::create([
                        'user_id'     => $nextInQueue->user_id,
                        'type'        => 'loan_success',
                        'message'     => "Le livre \"{$book->title}\" est disponible ! Venez le récupérer avant le "
                            . $nextInQueue->pickup_deadline->format('d/m/Y H:i') . '.',
                        'object_type' => 'loan',
                        'object_id'   => $nextInQueue->id,
                        'date_sent'   => $now,
                    ]);
                } else {
                    // Libérer l'exemplaire
                    $copy->update(['status' => 'disponible']);
                    $book->increment('nb_available');
                }

                // Notifier l'utilisateur dont le prêt a expiré
                Notification::create([
                    'user_id'     => $loan->user_id,
                    'type'        => 'loan_expired',
                    'message'     => "Votre emprunt pour \"{$book->title}\" a été annulé : le livre n'a pas été récupéré dans les 24h.",
                    'object_type' => 'loan',
                    'object_id'   => $loan->id,
                    'date_sent'   => $now,
                ]);

                $count++;
            });
        }

        $this->info("{$count} prêt(s) en attente expiré(s) traité(s).");
        return 0;
    }
}
