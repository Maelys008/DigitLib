<?php

namespace App\Console\Commands;

use App\Models\Incident;
use App\Models\Loan;
use App\Models\Penality;
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
            // Calculer la différence absolue en jours
            $daysLate = (int) now()->diffInDays(Carbon::parse($loan->expected_return_date));

            if ($daysLate <= 0) continue; // Sécurité si l'heure n'est pas encore dépassée

            $dailyAmount = $library->daily_penalty_amount ?? 0;
            $totalPenalty = $daysLate * $dailyAmount;

            // On ne met à jour que si la pénalité n'est pas encore marquée comme 'payé' 
            // ou on crée une nouvelle si elle n'existe pas.
            $penalty = Penality::where('loan_id', $loan->id)->first();

            if (!$penalty || $penalty->status !== 'payé') {
                Penality::updateOrCreate(
                    ['loan_id' => $loan->id],
                    [
                        'user_id' => $loan->user_id,
                        'amount' => $totalPenalty,
                        'reason' => "Retard de {$daysLate} jours pour le livre: {$loan->copy->book->title}",
                        'status' => 'non payé'
                    ]
                );
            }

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
