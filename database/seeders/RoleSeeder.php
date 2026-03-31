<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['name_role' => 'Super Admin', 'permissions' => 'all,manage_system', 'created_at' => now()],
            ['name_role' => 'Staff', 'permissions' => 'manage_books,manage_loans', 'created_at' => now()],
            ['name_role' => 'Librarian', 'permissions' => 'all', 'created_at' => now()],
            ['name_role' => 'Administrator', 'permissions' => 'all,manage_users,manage_libraries', 'created_at' => now()],
            ['name_role' => 'Reader', 'permissions' => 'borrow_books,join_clubs', 'created_at' => now()],
            ['name_role' => 'Club Moderator', 'permissions' => 'manage_clubs,moderate_messages', 'created_at' => now()],
        ]);
    }
}
