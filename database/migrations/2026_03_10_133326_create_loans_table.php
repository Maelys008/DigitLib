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
                'pending_pickup', // exemplaire dispo, en attente retrait (24h)
                'in_progress',    // retiré, emprunt en cours
                'returned',       // retourné
                'cancelled',      // annulé par l'utilisateur avant retrait
                'expired',        // non retiré dans les 24h
                'reserved',       // file d'attente, exemplaire indisponible
            ])->default('pending_pickup');
            $table->timestamp('pickup_deadline')->nullable(); // deadline retrait 24h
            $table->date('loan_date')->nullable();            // date retrait physique
            $table->date('expected_return_date')->nullable(); // calculée à pending_pickup
            $table->date('actual_return_date')->nullable();
            $table->foreignId('returned_by')->nullable()->constrained('users');
            $table->enum('condition_on_return', ['new', 'good', 'damaged', 'very_damaged'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
