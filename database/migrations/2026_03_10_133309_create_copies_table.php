<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copies', function (Blueprint $table) {
            $table->id();
            $table->string('codeQR', 64)->unique()->nullable();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->foreignId('copy_state_id')->constrained('copy_states'); 
            $table->enum('status', [
                'disponible', // libre
                'réservée',  // réservé (en_attente_retrait pour quelqu'un)
                'emprunté',  // actuellement emprunté
                'perdue',      // déclaré perdu après 30j de retard
            ])->default('disponible');
            $table->date('date_added');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copies');
    }
};
