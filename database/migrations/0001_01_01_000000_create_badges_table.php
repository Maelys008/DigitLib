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
        Schema::create('badges', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string('name');
            $table->integer('condition_of_obtaining');
            $table->integer('maximum_book');
            $table->timestamps();
        });

        DB::table('badges')->insert([
            ['name' => 'Bronze',     'condition_of_obtaining' => 0,    'maximum_book' => 2,  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Argent',     'condition_of_obtaining' => 50,   'maximum_book' => 4,  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Or',         'condition_of_obtaining' => 150,  'maximum_book' => 6,  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Platine',    'condition_of_obtaining' => 350,  'maximum_book' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Diamant',    'condition_of_obtaining' => 700,  'maximum_book' => 15, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Légendaire', 'condition_of_obtaining' => 1200, 'maximum_book' => 25, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('badges');
    }
};
