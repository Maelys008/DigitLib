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
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'loans:update-penalties';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Met à jour les pénalités de retard et crée les incidents en cas de perte';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Récupérer les emprunts en retard non rendus
        $loans = Loan::whereNull('actual_return_date')
            ->whereDate('expected_return_date', '<=', today())
            ->with('copy.book.library')
            ->get();
        $this->info("Nombre d'emprunts trouvés : " . $loans->count());

        foreach ($loans as $loan) {
            $library = $loan->copy->book->library;
            // Calculer la différence absolue en jours
            $expectedDate = Carbon::parse($loan->expected_return_date)->startOfDay();
            $daysLate = (int) $expectedDate->diffInDays(today());

            $this->line("Emprunt #{$loan->id} : en retard de {$daysLate} jours.");

            if ($daysLate <= 0) {
                continue;
            } // Sécurité si l'heure n'est pas encore dépassée

            $dailyAmount = $library->daily_penalty_amount ?? 0;
            $totalPenalty = $daysLate * $dailyAmount;

            $totalPenalty = (int) $totalPenalty;

            // On ne met à jour que si la pénalité n'est pas encore marquée comme 'payé'
            // ou on crée une nouvelle si elle n'existe pas.
            $penalty = Penalty::where('loan_id', $loan->id)->first();

            $wasNew = false;
            if (! $penalty || $penalty->status !== 'payé') {
                $wasNew = !Penalty::where('loan_id', $loan->id)->exists();

                $penalty = Penalty::updateOrCreate(
                    ['loan_id' => $loan->id],
                    [
                        'user_id' => $loan->user_id,
                        'amount' => $totalPenalty,
                        'reason' => "Retard de {$daysLate} jours pour le livre: {$loan->copy->book->title}",
                        'status' => 'non payé',
                    ]
                );
            }

            /**
             * Logique d'envoi de notification :
             * On envoie une alerte dans deux cas précis :
             * 1. $wasNew : C'est la première fois qu'on crée cette pénalité.
             * 2. $daysLate % 7 == 0 : Le retard atteint une semaine complète (7j, 14j, 21j...). 
             * Cela permet de relancer l'utilisateur tous les 7 jours sans le spammer quotidiennement.
             */

            if ($wasNew || $daysLate % 7 == 0) {
                Notification::create([
                    'user_id' => $loan->user_id,
                    'type' => 'penalty_reminder',
                    'message' => "Alerte Retard : Une pénalité de {$totalPenalty} FCFA est en cours pour '{$loan->copy->book->title}'. Merci de le rendre au plus vite.",
                    'object_type' => 'loan',
                    'object' => $loan->id,
                    'date_sent' => now(),
                ]);

                $this->info("Notification envoyée à l'utilisateur {$loan->user_id}");
            }


            // 3. Gestion de l'incident (Livre perdu après 30 jours)
            if ($daysLate >= 30) {
                $alreadyExists = Incident::where('loan_id', $loan->id)->exists();
                if (! $alreadyExists) {
                    Incident::create([
                        'user_id' => $loan->user_id,
                        'library_id' => $library->id,
                        'loan_id' => $loan->id,
                        'description' => 'Livre considéré comme perdu après 30 jours de retard.',
                        'date' => now(),
                    ]);

                    $loan->copy->update(['status' => 'perdu']);
                }
            }
        }
        $this->info("Traitement de {$loans->count()} emprunts en retard...");
    }
}
