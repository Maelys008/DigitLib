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
            $table->foreignId('book_id')->constrained('books');
            $table->enum('condition', ['new', 'good', 'damaged', 'very_damaged'])->default('new');
            $table->enum('status', [
                'available', // libre
                'reserved',  // réservé (en_attente_retrait pour quelqu'un)
                'borrowed',  // actuellement emprunté
                'lost',      // déclaré perdu après 30j de retard
            ])->default('available');
            $table->date('date_added');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copies');
    }
};
