<?php

namespace App\Console\Commands;

use App\Models\Incident;
use App\Models\Loan;
use App\Models\Notification;
use App\Models\Penalty;
use Carbon\Carbon;
use Illuminate\Console\Command;

class UpdatePenalties extends Command
{
    protected $signature = 'loans:update-penalties';

    protected $description = 'Met à jour les pénalités de retard et crée les incidents en cas de perte (>30j)';

    public function handle()
    {
        $today = today();

        // Emprunts en cours dont la date de retour est dépassée
        $loans = Loan::where('status', Loan::STATUS_IN_PROGRESS)
            ->whereDate('expected_return_date', '<=', $today)
            ->with(['user', 'copy.book.library'])
            ->get();

        $this->info("{$loans->count()} emprunt(s) en retard trouvé(s).");

        foreach ($loans as $loan) {
            $library      = $loan->copy->book->library;
            $expectedDate = Carbon::parse($loan->expected_return_date)->startOfDay();
            $daysLate     = (int) $expectedDate->diffInDays($today);

            if ($daysLate <= 0) {
                continue;
            }

            $dailyAmount  = $library->daily_penalty_amount ?? 0;
            $totalPenalty = (int) ($daysLate * $dailyAmount);

            // Créer ou mettre à jour la pénalité (sauf si déjà payée)
            $penalty = Penalty::where('loan_id', $loan->id)->first();

            if (! $penalty || $penalty->status !== 'paid') {
                $wasNew = ! $penalty;

                $penalty = Penalty::updateOrCreate(
                    ['loan_id' => $loan->id],
                    [
                        'user_id' => $loan->user_id,
                        'amount'  => $totalPenalty,
                        'reason'  => "Retard de {$daysLate} jour(s) pour \"{$loan->copy->book->title}\"",
                        'status'  => 'unpaid',
                    ]
                );

                // Notifier au 1er jour de retard, puis tous les 7 jours
                if ($wasNew || $daysLate % 7 === 0) {
                    Notification::create([
                        'user_id'     => $loan->user_id,
                        'type'        => 'penalty_reminder',
                        'message'     => "Retard : pénalité de {$totalPenalty} FCFA en cours pour \"{$loan->copy->book->title}\". Merci de le rendre au plus vite.",
                        'object_type' => 'loan',
                        'object_id'   => $loan->id,
                        'date_sent'   => now(),
                    ]);

                    $this->line("Notification envoyée → user #{$loan->user_id} ({$daysLate}j de retard)");
                }
            }

            // Livre perdu après 30 jours → incident + copy lost
            if ($daysLate >= 30) {
                $incidentExists = Incident::where('loan_id', $loan->id)->exists();

                if (! $incidentExists) {
                    Incident::create([
                        'user_id'              => $loan->user_id,
                        'library_id'           => $library->id,
                        'loan_id'              => $loan->id,
                        'title'                => 'Livre perdu',
                        'description'          => "Livre considéré comme perdu après {$daysLate} jours de retard.",
                        'date'                 => now(),
                        'status'               => 'open',
                        'notify_all_librarians' => true,
                    ]);

                    $loan->copy->update(['status' => 'lost']);

                    $this->warn("Incident créé → loan #{$loan->id} (livre perdu après {$daysLate}j)");
                }
            }
        }

        $this->info('Traitement terminé.');
        return 0;
    }
}
