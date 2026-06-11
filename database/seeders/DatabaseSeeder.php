<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // BadgeSeeder::class,           // badges avant users (FK badge_id)
            // RoleSeeder::class,            // roles avant internal_members
            // GenreSeeder::class,           // genres avant books
            //UserSeeder::class,            // users avant tout le reste
            //LibraryAndBookSeeder::class,  // bibliothèques, livres, exemplaires, prêts, pénalités
            //ClubSeeder::class,            // clubs, membres, messages
        ]);
    }
}
