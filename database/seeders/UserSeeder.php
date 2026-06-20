<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // badge_id=1 = Bronze (id auto-increment, doit exister via BadgeSeeder)
        $bronzeId = DB::table('badges')->where('name', 'Bronze')->value('id');

        $users = [
            // Bibliothécaire admin (crée la bibliothèque)
            [
                'name'              => 'Kofi Admin',
                'email'             => 'admin@digilib.test',
                'tel'               => '+22997000001',
                'score'             => 0,
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'identity_hash'     => Hash::make('ANIP-ADMIN-001'),
                'status'            => 'active',
                'badge_id'          => $bronzeId,
            ],
            // Assistant bibliothécaire
            [
                'name'              => 'Ama Assistante',
                'email'             => 'assistant@digilib.test',
                'tel'               => '+22997000002',
                'score'             => 0,
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'identity_hash'     => Hash::make('ANIP-ASST-002'),
                'status'            => 'active',
                'badge_id'          => $bronzeId,
            ],
            // Lecteurs
            [
                'name'              => 'Brice Lecteur',
                'email'             => 'lecteur1@digilib.test',
                'tel'               => '+22997000003',
                'score'             => 0,
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'identity_hash'     => Hash::make('ANIP-LEC-003'),
                'status'            => 'active',
                'badge_id'          => $bronzeId,
            ],
            [
                'name'              => 'Carine Lectrice',
                'email'             => 'lecteur2@digilib.test',
                'tel'               => '+22997000004',
                'score'             => 0,
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'identity_hash'     => Hash::make('ANIP-LEC-004'),
                'status'            => 'active',
                'badge_id'          => $bronzeId,
            ],
            // Lecteur avec pénalité (pour tester le blocage)
            [
                'name'              => 'Driss Penalise',
                'email'             => 'penalise@digilib.test',
                'tel'               => '+22997000005',
                'score'             => 0,
                'email_verified_at' => now(),
                'password'          => Hash::make('password'),
                'identity_hash'     => Hash::make('ANIP-LEC-005'),
                'status'            => 'active',
                'badge_id'          => $bronzeId,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insert(array_merge($user, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
