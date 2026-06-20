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
        Schema::create('libraries', function (Blueprint $table) {
            $table->id()->autoIncrement();
            $table->string('name');
            $table->string('adress');
            $table->string('library_phone')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('libraries');
            $table->foreignId('administrator_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            //  $table->enum('status', ['en attente', 'approuvée', 'rejetée'])->default('en attente');
            $table->string('library_image')->nullable();
            $table->integer('loan_duration')->default(14);
            // $table->integer('max_books_per_user')->nullable();//infini
            $table->decimal('daily_penalty_amount', 8, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('libraries');
    }
};
