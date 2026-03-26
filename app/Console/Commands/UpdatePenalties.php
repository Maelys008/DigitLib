<?php

namespace App\Console\Commands;

use App\Models\Incident;
use App\Models\Loan;
use App\Models\Penality;
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
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Récupérer les emprunts en retard non rendus
        $loans = Loan::whereNull('actual_return_date')
            ->where('expected_return_date', '<', now())
            ->with('copy.book.library')
            ->get();

        foreach ($loans as $loan) {
            $library = $loan->copy->book->library;
            $daysLate = (int) now()->diffInDays($loan->expected_return_date, true);

            // Calcul du montant basé sur les réglages de la bibliothèque
            $dailyAmount = $library->daily_penalty_amount ?? 0;
            $totalPenalty = $daysLate * $dailyAmount;

            // 2. Mettre à jour ou créer la pénalité
            $penalty = Penality::updateOrCreate(
                ['loan_id' => $loan->id],
                [
                    'user_id' => $loan->user_id,
                    'amount' => $totalPenalty,
                    'reason' => "Retard de {$daysLate} jours pour le livre: {$loan->copy->book->title}",
                    'status' => 'non payé'
                ]
            );

            // 3. Gestion de l'incident (Livre perdu après 30 jours)
            if ($daysLate >= 30) {
                $alreadyExists = Incident::where('loan_id', $loan->id)->exists();
                if (!$alreadyExists) {
                    Incident::create([
                        'user_id' => $loan->user_id,
                        'library_id' => $library->id,
                        'loan_id' => $loan->id,
                        'description' => "Livre considéré comme perdu après 30 jours de retard.",
                        'date' => now()
                    ]);

                    $loan->copy->update(['status' => 'perdu']);
                }
            }
        }
    }
}
