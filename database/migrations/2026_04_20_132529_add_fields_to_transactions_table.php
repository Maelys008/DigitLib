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
        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')
                    ->constrained('users')->nullOnDelete();
            }

            if (! Schema::hasColumn('transactions', 'penalty_id')) {
                $table->foreignId('penalty_id')->nullable()->after('user_id')
                    ->constrained('penalties')->nullOnDelete();
            }

            if (! Schema::hasColumn('transactions', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('provider');
            }

            if (! Schema::hasColumn('transactions', 'metadata')) {
                $table->json('metadata')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['penalty_id']);
            $table->dropColumn(['user_id', 'penalty_id', 'payment_method', 'metadata']);
        });
    }
};
