<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClubSeeder extends Seeder
{
    public function run(): void
    {
        $lecteur1Id = DB::table('users')->where('email', 'lecteur1@digilib.test')->value('id');
        $lecteur2Id = DB::table('users')->where('email', 'lecteur2@digilib.test')->value('id');

        $club1 = DB::table('clubs')->insertGetId([
            'name'        => 'Club des Lecteurs du Bénin',
            'description' => 'Un club pour tous les amateurs de littérature africaine.',
            'user_id'     => $lecteur1Id,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Membres du club
        DB::table('club_members')->insert([
            ['club_id' => $club1, 'user_id' => $lecteur1Id, 'created_at' => now(), 'updated_at' => now()],
            ['club_id' => $club1, 'user_id' => $lecteur2Id, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Quelques messages
        DB::table('messages')->insert([
            ['club_id' => $club1, 'user_id' => $lecteur1Id, 'message' => "Bienvenue dans notre club ! Quel est votre dernier livre préféré ?", 'created_at' => now()->subHours(2), 'updated_at' => now()->subHours(2)],
            ['club_id' => $club1, 'user_id' => $lecteur2Id, 'message' => "Merci ! J'ai adoré L'Étranger de Camus.",                           'created_at' => now()->subHours(1), 'updated_at' => now()->subHours(1)],
        ]);
    }
}
