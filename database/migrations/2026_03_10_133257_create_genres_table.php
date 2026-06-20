<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

         DB::table('genres')->insert([
            ['name' => 'Science-Fiction',       'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sciences',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Histoire',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Classique',              'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mystère',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Fantasy',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Roman',                  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Horreur',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Psychologie',            'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Philosophie',            'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Poésie',                 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Voyage',                 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cuisine',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Programmation',          'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Art',                    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jeunesse',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Thriller',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Développement personnel','created_at' => now(), 'updated_at' => now()],
        ]);
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genres');
    }
};
