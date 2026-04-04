<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('badges')->insert([
            [
                'name' => 'Bronze',
                'condition_of_obtaining' => 0,
                'maximum_book' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Argent',
                'condition_of_obtaining' => 50,
                'maximum_book' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Or',
                'condition_of_obtaining' => 150,
                'maximum_book' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Platine',
                'condition_of_obtaining' => 350,
                'maximum_book' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Diamant',
                'condition_of_obtaining' => 700,
                'maximum_book' => 15,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Légendaire',
                'condition_of_obtaining' => 1200,
                'maximum_book' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}