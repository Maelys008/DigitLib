<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['name_role' => 'Administrateur', 'permissions' => 'all,manage_users,manage_libraries', 'created_at' => now(), 'updated_at' => now()],
            ['name_role' => 'Bibliothécaire',  'permissions' => 'manage_loans,manage_books,manage_incidents', 'created_at' => now(), 'updated_at' => now()],
            ['name_role' => 'Assistant',       'permissions' => 'manage_books,manage_loans', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
