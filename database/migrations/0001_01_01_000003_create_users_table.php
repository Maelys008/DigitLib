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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->unique();
            $table->string('tel')->unique()->nullable();
            $table->integer('score')->default(0);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('identity_hash')->nullable();
            $table->string('status')->default('active');
            $table->boolean('is_super_admin')->default(false);
            $table->foreignId('badge_id')->nullable()->constrained('badges')->nullOnDelete();
            $table->string('otp_code')->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Schema::create('password_reset_tokens', function (Blueprint $table) {
        //     $table->string('email')->primary();
        //     $table->string('token');
        //     $table->timestamp('created_at')->nullable();
        // });

        // Schema::create('sessions', function (Blueprint $table) {
        //     $table->string('id')->primary();
        //     $table->foreignId('user_id')->nullable()->index();
        //     $table->string('ip_address', 45)->nullable();
        //     $table->text('user_agent')->nullable();
        //     $table->longText('payload');
        //     $table->integer('last_activity')->index();
        // });
  DB::table('users')->insert([
    [
                'name'              => 'Super Admin',
                'email'             => 'super.admin@digilib.test',
                'tel'               => '+22997000002',
                'score'             => 0,
                'email_verified_at' => now(),
                'password'          => bcrypt('password'),
                'identity_hash'     => bcrypt('ANIP-ASST-002'),
                'status'            => 'active',
                'badge_id'          => 'Bronze',
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        // Schema::dropIfExists('password_reset_tokens');
        // Schema::dropIfExists('sessions');
    }
};
