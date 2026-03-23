<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name' => 'User1',
                'email' => 'user1@test.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'badge_id' => 1,
                'status' => 'desactive',
                'created_at' => now()
            ],
            [
                'name' => 'User2',
                'email' => 'user2@test.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'badge_id' => 1,
                'status' => 'desactive',
                'created_at' => now()
            ],
            [
                'name' => 'User3',
                'email' => 'user3@test.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'badge_id' => 1,
                'status' => 'desactive',
                'created_at' => now()
            ],
            [
                'name' => 'User4',
                'email' => 'user4@test.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'badge_id' => 1,
                'status' => 'desactive',
                'created_at' => now()
            ],
            [
                'name' => 'User5',
                'email' => 'user5@test.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'badge_id' => 1,
                'status' => 'desactive',
                'created_at' => now()
            ],
            [
                'name' => 'User6',
                'email' => 'user6@test.com',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'badge_id' => 1,
                'status' => 'desactive',
                'created_at' => now()
            ],
        ]);
    }
}