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
        Schema::create('books', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->foreignId('library_id')->constrained('libraries');
            $table->string('title');
            $table->string('author');
            $table->string('genre');
            $table->string('isbn');
            $table->unique(['isbn', 'library_id']);
            $table->text('description')->nullable();
            $table->string('year_of_publication');
            $table->string('cover_image');
            $table->integer('nb_copy')->default(0);
            $table->integer('nb_available')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
