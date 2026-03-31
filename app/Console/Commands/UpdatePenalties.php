<?php

namespace App\Console\Commands;

use App\Models\Incident;
use App\Models\Loan;
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
    protected $description = 'Command description';

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
            // $daysLate = (int) today()->diffInDays($expectedDate);
            $daysLate = (int) $expectedDate->diffInDays(today());

            $this->line("Emprunt #{$loan->id} : en retard de {$daysLate} jours.");

            if ($daysLate <= 0) continue; // Sécurité si l'heure n'est pas encore dépassée

            $dailyAmount = $library->daily_penalty_amount ?? 0;
            $totalPenalty = $daysLate * $dailyAmount;

            // On ne met à jour que si la pénalité n'est pas encore marquée comme 'payé' 
            // ou on crée une nouvelle si elle n'existe pas.
            $penalty = Penalty::where('loan_id', $loan->id)->first();

            if (!$penalty || $penalty->status !== 'payé') {
                Penalty::updateOrCreate(
                    ['loan_id' => $loan->id],
                    [
                        'user_id' => $loan->user_id,
                        'amount' => $totalPenalty,
                        'reason' => "Retard de {$daysLate} jours pour le livre: {$loan->copy->book->title}",
                        'status' => 'non payé'
                    ]
                );
            }

    //     foreach ($loans as $loan) {
    // // 1. Vérification des relations
    // // if (!$loan->copy || !$loan->copy->book || !$loan->copy->book->library) {
    // //     $this->error("Erreur : Relations manquantes pour l'emprunt #{$loan->id}");
    // //     continue;
    // // }

    // $library = $loan->copy->book->library;
    
    // // 2. Calcul des jours (On s'assure d'avoir au moins 1 jour si la date est passée)
    // $expectedDate = Carbon::parse($loan->expected_return_date)->startOfDay();
    // $daysLate = (int) today()->diffInDays($expectedDate);

    // $this->line("Emprunt #{$loan->id} : {$daysLate} jours de retard.");

    // // TEST : Si expected_return_date était hier, daysLate doit être >= 1
    // if ($daysLate <= 0) {
    //     $this->warn("Ignoré : Le retard n'est pas encore effectif (0 jours).");
    //     continue;
    // }

    // $dailyAmount = $library->daily_penalty_amount ?? 0;
    // $totalPenalty = $daysLate * $dailyAmount;

    // $this->line("Montant calculé : {$totalPenalty} (Taux : {$dailyAmount})");

    // // 3. Vérification du statut de la pénalité
    // $penalty = Penalty::where('loan_id', $loan->id)->first();

    // if (!$penalty || $penalty->status !== 'payé') {
    //     $newPenalty = Penalty::updateOrCreate(
    //         ['loan_id' => $loan->id],
    //         [
    //             'user_id' => $loan->user_id,
    //             'amount' => $totalPenalty,
    //             'reason' => "Retard de {$daysLate} jours pour le livre: {$loan->copy->book->title}",
    //             'status' => 'non payé'
    //         ]
    //     );
    //     $this->info("Pénalité mise à jour/créée pour l'emprunt #{$loan->id}");
    // } else {
    //     $this->comment("Pénalité déjà payée pour l'emprunt #{$loan->id}");
    // }
    
  


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
        $this->info("Traitement de {$loans->count()} emprunts en retard...");
    }
}
