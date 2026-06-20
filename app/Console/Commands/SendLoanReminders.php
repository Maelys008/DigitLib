<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendLoanReminders extends Command
{
    protected $signature = 'loans:send-reminders';

    protected $description = 'Envoie un rappel aux utilisateurs dont le retour est prévu dans 2 jours';

    public function handle()
    {
        $targetDate = Carbon::now()->addDays(2)->toDateString();

        $loans = Loan::whereDate('expected_return_date', $targetDate)
            ->where('status', Loan::STATUS_IN_PROGRESS)
            ->with(['user', 'copy.book'])
            ->get();

        $count = 0;

        foreach ($loans as $loan) {
            // Éviter les doublons : ne pas notifier si déjà fait aujourd'hui
            $alreadyNotified = Notification::where('object_id', $loan->id)
                ->where('type', 'reminder')
                ->whereDate('created_at', now()->toDateString())
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            Notification::create([
                'user_id'     => $loan->user_id,
                'type'        => 'reminder',
                'message'     => "Rappel : \"{$loan->copy->book->title}\" doit être rendu dans 2 jours (le "
                    . Carbon::parse($loan->expected_return_date)->format('d/m/Y') . ').',
                'object_type' => 'loan',
                'object_id'   => $loan->id,
                'date_sent'   => now(),
            ]);

            $count++;
        }

        $this->info("{$count} rappel(s) envoyé(s).");
        return 0;
    }
}
