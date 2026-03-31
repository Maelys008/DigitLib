<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('badges')->insert([
            ['name' => 'Bronze', 'condition_of_obtaining' => 0, 'maximum_book' => 2, 'created_at' => now()],
            ['name' => 'Argent', 'condition_of_obtaining' => 100, 'maximum_book' => 5, 'created_at' => now()],
            ['name' => 'Or', 'condition_of_obtaining' => 500, 'maximum_book' => 10, 'created_at' => now()],
            ['name' => 'Platine', 'condition_of_obtaining' => 1000, 'maximum_book' => 20, 'created_at' => now()],
            ['name' => 'Diamant', 'condition_of_obtaining' => 5000, 'maximum_book' => 50, 'created_at' => now()],
            ['name' => 'Légendaire', 'condition_of_obtaining' => 10000, 'maximum_book' => 100, 'created_at' => now()],
        ]);
    }
}
