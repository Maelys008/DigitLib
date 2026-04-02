<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('genres')->insert([
            ['id' => 1, 'name' => 'Science-Fiction', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Sciences', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Histoire', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Classique', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Mystère', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Fantasy', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'name' => 'Roman', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8, 'name' => 'Horreur', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 9, 'name' => 'Psychologie', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'Philosophie', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'name' => 'Poésie', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'name' => 'Voyage', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'name' => 'Cuisine', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 14, 'name' => 'Programmation', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 15, 'name' => 'Art', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 16, 'name' => 'Jeunesse', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 17, 'name' => 'Thriller', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 18, 'name' => 'Développement personnel', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
