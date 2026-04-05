<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
           // DigilibSeeder::class,
             GenreSeeder::class,
             RoleSeeder::class,
             BadgeSeeder::class,
             //BookSeeder::class,
             //BadgeSeeder::class,
            UserSeeder::class,
            // LibraryAndBookSeeder::class,
            ClubSeeder::class,
        ]);
    }
}
