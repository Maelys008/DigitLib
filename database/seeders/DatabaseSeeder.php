<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Badge;
use App\Models\Library;
use App\Models\Book;
use App\Models\Copy;
use App\Models\Loan;
use App\Models\Club;
use App\Models\Club_member;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Penality;
use App\Models\Reservation;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

      
        $badges = [];
        for ($i = 1; $i <= 5; $i++) {
            $badges[] = Badge::create([
                'name' => "Badge $i",
                'condition_of_obtaining' => "Condition $i",
                'maximum_book' => rand(5, 20),
            ]);
        }

        
        $users = [];
        for ($i = 1; $i <= 10; $i++) {
            $users[] = User::create([
                'name' => "Utilisateur $i",
                'email' => "user$i@example.com",
                'tel' => "9000000$i",
                'password' => Hash::make('password'),
                'role' => $i == 1 ? 'admin' : 'reader',
                'badge_id' => $badges[array_rand($badges)]->id,
                'score' => rand(0, 100),
                'status' => 'active',
            ]);
        }

        
        $libraries = [];
        for ($i = 1; $i <= 5; $i++) {
            $libraries[] = Library::create([
                'name' => "Bibliothèque " . chr(64 + $i),
                'adress' => "Adresse $i, Cotonou",
                'description' => "Description de la bibliothèque $i",
                'administrator_id' => $users[0]->id, // Le premier user est admin
            ]);
        }

        
        $books = [];
        for ($i = 1; $i <= 15; $i++) {
            $books[] = Book::create([
                'library_id' => $libraries[array_rand($libraries)]->id,
                'title' => "Livre Titre $i",
                'author' => "Auteur $i",
                'genre' => "Genre " . rand(1, 5),
                'isbn' => "ISBN-".rand(1000, 9999),
                'year_of_publication' => now()->subYears(rand(1, 10))->format('Y-m-d'),
                'cover_image' => 'default.jpg',
                'nb_copy' => 5,
                'nb_available' => 5,
            ]);
        }

        
        foreach ($books as $book) {
            // Créer 2 copies par livre
            for ($j = 1; $j <= 2; $j++) {
                Copy::create([
                    'book_id' => $book->id,
                    'codeQR' => "QR-{$book->id}-$j",
                    'book_status' => 'neuf',
                    'status' => 'disponible',
                    'date_added' => now(),
                ]);
            }
            
            
            Reservation::create([
                'user_id' => $users[array_rand($users)]->id,
                'book_id' => $book->id,
                'status' => 'en attente',
            ]);
        }

        
        $copies = Copy::all();
        for ($i = 0; $i < 10; $i++) {
            $loan = Loan::create([
                'user_id' => $users[array_rand($users)]->id,
                'copy_id' => $copies[$i]->id,
                'loan_date' => now()->subDays(10),
                'expected_return_date' => now()->addDays(5),
            ]);

            if ($i % 3 == 0) { 
                Penality::create([
                    'user_id' => $loan->user_id,
                    'loan_id' => $loan->id,
                    'amount' => "500",
                    'reason' => "Retard",
                    'status' => 'non payé',
                ]);
            }
        }

        
        for ($i = 1; $i <= 5; $i++) {
            $club = Club::create([
                'user_id' => $users[array_rand($users)]->id,
                'name' => "Club de Lecture $i",
                'description' => "Discussion autour du genre $i",
            ]);

            
            foreach (array_slice($users, 0, 5) as $u) {
                $member = Club_member::create([
                    'user_id' => $u->id,
                    'club_id' => $club->id,
                    'date_joined' => now(),
                ]);

                
                Message::create([
                    'member_id' => $member->id,
                    'club_id' => $club->id,
                    'message' => "Bonjour tout le monde ici le membre {$u->name} !",
                ]);
            }
        }

        
        for ($i = 0; $i < 10; $i++) {
            Notification::create([
                'user_id' => $users[array_rand($users)]->id,
                'type' => 'info',
                'message' => "Ceci est la notification $i",
                'object_type' => 'System',
                'object' => 'General',
                'status' => 'non lu',
                'date_sent' => now(),
            ]);
        }
    }
}