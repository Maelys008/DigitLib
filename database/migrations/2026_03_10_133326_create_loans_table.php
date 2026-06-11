<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('copy_id')->constrained('copies');
            $table->enum('status', [
                'en_attente_de_retrait', // exemplaire dispo, en attente retrait (24h)
                'en_cours',    // retiré, emprunt en cours
                'retourné',       // retourné
                'annulé',      // annulé par l'utilisateur avant retrait
                'expiré',        // non retiré dans les 24h
                'réservée',       // file d'attente, exemplaire indisponible
            ])->default('en_attente_de_retrait');
            $table->timestamp('pickup_deadline')->nullable(); // deadline retrait 24h
            $table->date('loan_date')->nullable();            // date retrait physique
            $table->date('expected_return_date')->nullable(); // calculée à en_attente_de_retrait
            $table->date('actual_return_date')->nullable();
            $table->foreignId('returned_by')->nullable()->constrained('users');
            $table->foreignId('return_copy_state_id')->nullable()->constrained('copy_states');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
