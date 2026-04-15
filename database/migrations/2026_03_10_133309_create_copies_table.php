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
        Schema::create('copies', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->foreignId('book_id')->constrained('books');
            $table->enum('condition', ['neuf', 'bon', 'abimé', 'très abimé'])->default('neuf');
            $table->string('status')->default('disponible');
            $table->string('codeQR', 64)->unique()->nullable()->after('id');
            $table->date('date_added');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('copies');
    }
};
