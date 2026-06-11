<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copy_states', function (Blueprint $table) {
            $table->id();
            $table->string('libelle_state'); // 'nouvelle', 'bon', 'endommagé', 'très_endommagé'
            $table->string('color')->nullable(); // Pour l'affichage : 'green', 'yellow', 'orange', 'red'
            $table->timestamps();
        });

        // Insérer les états par défaut
        DB::table('copy_states')->insert([
            ['libelle_state' => 'nouvelle', 'color' => 'green', 'created_at' => now()],
            ['libelle_state' => 'bon', 'color' => 'blue', 'created_at' => now()],
            ['libelle_state' => 'endommagé', 'color' => 'orange', 'created_at' => now()],
            ['libelle_state' => 'très_endommagé', 'color' => 'red', 'created_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('copy_states');
    }
};