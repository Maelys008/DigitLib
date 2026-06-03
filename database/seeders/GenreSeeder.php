<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('genres')->insert([
            ['name' => 'Science-Fiction',       'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sciences',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Histoire',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Classique',              'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mystère',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Fantasy',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Roman',                  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Horreur',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Psychologie',            'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Philosophie',            'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Poésie',                 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Voyage',                 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cuisine',                'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Programmation',          'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Art',                    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jeunesse',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Thriller',               'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Développement personnel','created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
