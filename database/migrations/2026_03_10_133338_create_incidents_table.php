<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('library_id')->nullable()->constrained('libraries')->onDelete('cascade');
            $table->foreignId('loan_id')->nullable()->constrained('loans')->onDelete('cascade');
            
            // Champs principaux
            $table->text('description');
            $table->string('title')->nullable();
            $table->string('severity')->default('warning');
            $table->date('date');
            
            // Statut
            $table->enum('status', ['open', 'pending', 'resolved', 'public'])->default('pending');
            
            // Casier bibliothécaire 
            $table->boolean('is_library_record')->default(false);
            $table->boolean('notify_all_librarians')->default(false);
            
            // Relations
            $table->foreignId('related_incident_id')->nullable()->constrained('incidents')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Timestamps
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // Index
            $table->index(['user_id', 'library_id']);
            $table->index(['status', 'severity']);
            $table->index(['is_library_record']); // ← Important pour les filtres
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};