<?php

namespace App\Console\Commands;

use App\Models\Loan;
use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendLoanReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loans:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoie une notification aux utilisateurs dont l\'emprunt expire dans 2 jours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // On cible la date d'expiration exacte (aujourd'hui + 2 jours)
        $targetDate = Carbon::now()->addDays(2)->toDateString();

        // On récupère les prêts non encore rendus qui expirent à cette date
        $loans = Loan::whereDate('expected_return_date', $targetDate)
            ->whereNull('actual_return_date')
            ->with(['user', 'copy.book'])
            ->get();

        foreach ($loans as $loan) {
            $alreadyNotified = Notification::where('object', $loan->id)
                ->whereDate('created_at', now()->toDateString())
                ->exists();

            if (! $alreadyNotified) {
                Notification::create([
                    'user_id' => $loan->user_id,
                    'type' => 'reminder',
                    'message' => "Rappel : Le livre '{$loan->copy->book->title}' doit être rendu dans 2 jours (le " . Carbon::parse($loan->expected_return_date)->format('d/m/Y') . ').',
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => now(),
                ]);
            }
        }
        $this->info(count($loans) . ' notifications de rappel envoyées.');
    }
}
