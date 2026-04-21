<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); 
            $table->string('provider'); // 'fedapay' ou 'kkiapay'
            $table->string('external_id')->nullable(); // ID renvoyé par le prestataire
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('XOF');
            $table->enum('status', ['pending', 'success', 'failed', 'canceled'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
