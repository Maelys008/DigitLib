<?php

namespace Database\Seeders;

use App\Models\Club;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClubSeeder extends Seeder
{
    public function run(): void
    {
    //     // Club 1
    //     $clubId1 = DB::table('clubs')->insertGetId([
    //         'user_id' => 1,
    //         'name' => 'Club des Classiques',
    //         'description' => 'Discussion sur la littérature du 20ème siècle.',
    //         'created_at' => now(),
    //     ]);
    //     $memberId1 = DB::table('club_members')->insertGetId([
    //         'user_id' => 1,
    //         'club_id' => $clubId1,
    //         'date_joined' => now(),
    //         'created_at' => now(),
    //     ]);
    //     DB::table('messages')->insert([
    //         'member_id' => $memberId1,
    //         'club_id' => $clubId1,
    //         'message' => 'Bienvenue dans le club !',
    //         'created_at' => now(),
    //     ]);

    //     // Club 2
    //     $clubId2 = DB::table('clubs')->insertGetId([
    //         'user_id' => 2,
    //         'name' => 'Club Science-Fiction',
    //         'description' => 'Exploration des univers futuristes et dystopiques.',
    //         'created_at' => now(),
    //     ]);
    //     $memberId2 = DB::table('club_members')->insertGetId([
    //         'user_id' => 2,
    //         'club_id' => $clubId2,
    //         'date_joined' => now(),
    //         'created_at' => now(),
    //     ]);
    //     DB::table('messages')->insert([
    //         'member_id' => $memberId2,
    //         'club_id' => $clubId2,
    //         'message' => 'Premier message du club SF !',
    //         'created_at' => now(),
    //     ]);

    //     // Club 3
    //     $clubId3 = DB::table('clubs')->insertGetId([
    //         'user_id' => 4,
    //         'name' => 'Club Jeunesse',
    //         'description' => 'Lectures pour adolescents et jeunes adultes.',
    //         'created_at' => now(),
    //     ]);
    //     $memberId3 = DB::table('club_members')->insertGetId([
    //         'user_id' => 4,
    //         'club_id' => $clubId3,
    //         'date_joined' => now(),
    //         'created_at' => now(),
    //     ]);
    //     DB::table('messages')->insert([
    //         'member_id' => $memberId3,
    //         'club_id' => $clubId3,
    //         'message' => 'Rendez-vous pour notre première réunion !',
    //         'created_at' => now(),
    //     ]);
   

      // Récupérer un utilisateur existant (ou en créer un)
        $user = User::first();

        if (!$user) {
            $user = User::create([
                'name' => 'Admin Club',
                'email' => 'club@admin.com',
                'password' => bcrypt('password'),
            ]);
        }

        $clubs = [
            [
                'name' => 'Club Lecture Fantasy',
                'description' => 'Pour les amateurs de fantasy, magie et mondes imaginaires.',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Cercle des Poètes',
                'description' => 'Partagez et discutez de vos poèmes préférés.',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Club Science-Fiction',
                'description' => 'Voyagez dans le futur avec nos lectures SF.',
                'user_id' => $user->id,
            ],
            [
                'name' => 'Les Mordus de Romans',
                'description' => 'Pour tous les amoureux de romans contemporains.',
                'user_id' => $user->id,
            ],
        ];

        foreach ($clubs as $clubData) {
            Club::create($clubData);
        }
    }
}