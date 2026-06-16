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
        Schema::create('roles', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string('name_role');
            $table->timestamps();
        });

         DB::table('roles')->insert([
            ['name_role' => 'Super Admin', 'created_at' => now(), 'updated_at' => now()],
            ['name_role' => 'Administrateur biblio', 'created_at' => now(), 'updated_at' => now()],
            ['name_role' => 'Bibliothécaire', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
