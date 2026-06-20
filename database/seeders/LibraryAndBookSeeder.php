<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LibraryAndBookSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = DB::table('users')->where('email', 'admin@digilib.test')->value('id');
        $asstId = DB::table('users')->where('email', 'assistant@digilib.test')->value('id');
        $roleAdminId = DB::table('roles')->where('name_role', 'Administrateur')->value('id');
        $roleAsstId = DB::table('roles')->where('name_role', 'Assistant')->value('id');

        // ── Bibliothèque 1 : Centrale (bibliothèque parente) ──────────────────
        $lib1 = DB::table('libraries')->insertGetId([
            'name' => 'Bibliothèque Centrale de Cotonou',
            'adress' => 'Avenue Jean-Paul II, Cotonou',
            'library_phone' => '+22921000001',
            'description' => 'La bibliothèque centrale avec le plus grand catalogue.',
            'administrator_id' => $adminId,
            'loan_duration' => 14,
            'daily_penalty_amount' => 100,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Membres internes de lib1
        $member1 = DB::table('internal_members')->insertGetId([
            'user_id' => $adminId,
            'library_id' => $lib1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // DB::table('role_assignments')->insert([
        //     'internal_member_id' => $member1,
        //     'role_id'            => $roleAdminId,
        //     'date_assignment'    => now(),
        //     'created_at'         => now(),
        //     'updated_at'         => now(),
        // ]);
        DB::table('role_user')->insert([
            'user_id' => $member1,
            'library_id' => $lib1,
            'role_id' => $roleAdminId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $member2 = DB::table('internal_members')->insertGetId([
            'user_id' => $asstId,
            'library_id' => $lib1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        // DB::table('role_assignments')->insert([
        //     'internal_member_id' => $member2,
        //     'role_id'            => $roleAsstId,
        //     'date_assignment'    => now(),
        //     'created_at'         => now(),
        //     'updated_at'         => now(),
        // ]);

        DB::table('role_user')->insert([
            'user_id' => $member2,
            'library_id' => $lib1,
            'role_id' => $roleAsstId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── Bibliothèque 2 : Enfant de lib1 ──────────────────────────────────
        $lib2 = DB::table('libraries')->insertGetId([
            'name' => 'Annexe Universitaire de Godomey',
            'adress' => 'Campus Godomey, Abomey-Calavi',
            'library_phone' => '+22921000002',
            'description' => 'Bibliothèque universitaire, spécialisée en sciences.',
            'parent_id' => $lib1,
            'administrator_id' => $adminId,
            'loan_duration' => 21,
            'daily_penalty_amount' => 150,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $member3 = DB::table('internal_members')->insertGetId([
            'user_id' => $adminId,
            'library_id' => $lib2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('role_assignments')->insert([
            'internal_member_id' => $member3,
            'role_id' => $roleAdminId,
            'date_assignment' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ── Genres ─────────────────────────────────────────────────────────────
        $genreRoman = DB::table('genres')->where('name', 'Roman')->value('id');
        $genreSF = DB::table('genres')->where('name', 'Science-Fiction')->value('id');
        $genrePhilo = DB::table('genres')->where('name', 'Philosophie')->value('id');
        $genrePsycho = DB::table('genres')->where('name', 'Psychologie')->value('id');
        $genreThrill = DB::table('genres')->where('name', 'Thriller')->value('id');
        $genreProg = DB::table('genres')->where('name', 'Programmation')->value('id');

        // ── Livres Bibliothèque 1 ─────────────────────────────────────────────

        // Livre A : 2 exemplaires disponibles
        $bookA = DB::table('books')->insertGetId([
            'library_id' => $lib1,
            'title' => "L'Étranger",
            'author' => 'Albert Camus',
            'genre_id' => $genreRoman,
            'isbn' => '9782070360024',
            'description' => "Un homme indifférent au monde qui l'entoure commet un meurtre absurde.",
            'year_of_publication' => 1942,
            'nb_copy' => 2,
            'nb_available' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookA, 'codeQR' => 'QR-LIB1-A-001', 'condition' => 'nouvelle',  'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['book_id' => $bookA, 'codeQR' => 'QR-LIB1-A-002', 'condition' => 'bon', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Livre B : 1 seul exemplaire (pour tester la file d'attente)
        $bookB = DB::table('books')->insertGetId([
            'library_id' => $lib1,
            'title' => 'Le Mythe de Sisyphe',
            'author' => 'Albert Camus',
            'genre_id' => $genrePhilo,
            'isbn' => '9782070322886',
            'description' => "Essai philosophique sur l'absurde.",
            'year_of_publication' => 1942,
            'nb_copy' => 1,
            'nb_available' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookB, 'codeQR' => 'QR-LIB1-B-001', 'condition' => 'nouvelle', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Livre C : 3 exemplaires (dont 1 emprunté → pour tester retour)
        $bookC = DB::table('books')->insertGetId([
            'library_id' => $lib1,
            'title' => 'Thinking, Fast and Slow',
            'author' => 'Daniel Kahneman',
            'genre_id' => $genrePsycho,
            'isbn' => '9780374533557',
            'description' => 'Les deux systèmes de pensée qui gouvernent nos décisions.',
            'year_of_publication' => 2011,
            'nb_copy' => 3,
            'nb_available' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $copyC1 = DB::table('copies')->insertGetId(['book_id' => $bookC, 'codeQR' => 'QR-LIB1-C-001', 'condition' => 'nouvelle',  'status' => 'emprunté',  'date_added' => now(), 'created_at' => now(), 'updated_at' => now()]);
        DB::table('copies')->insert([
            ['book_id' => $bookC, 'codeQR' => 'QR-LIB1-C-002', 'condition' => 'bon', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['book_id' => $bookC, 'codeQR' => 'QR-LIB1-C-003', 'condition' => 'nouvelle',  'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Livre D : Thriller (pour tests avis, favoris, étagères)
        $bookD = DB::table('books')->insertGetId([
            'library_id' => $lib1,
            'title' => 'Le Da Vinci Code',
            'author' => 'Dan Brown',
            'genre_id' => $genreThrill,
            'isbn' => '9782709626088',
            'description' => 'Un symbologiste enquête sur un meurtre au Louvre.',
            'year_of_publication' => 2003,
            'nb_copy' => 2,
            'nb_available' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookD, 'codeQR' => 'QR-LIB1-D-001', 'condition' => 'bon', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['book_id' => $bookD, 'codeQR' => 'QR-LIB1-D-002', 'condition' => 'bon', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── Livres Bibliothèque 2 ─────────────────────────────────────────────

        // Livre E : SF
        $bookE = DB::table('books')->insertGetId([
            'library_id' => $lib2,
            'title' => '1984',
            'author' => 'George Orwell',
            'genre_id' => $genreSF,
            'isbn' => '9782266208995',
            'description' => 'Une dystopie totalitaire implacable.',
            'year_of_publication' => 1949,
            'nb_copy' => 2,
            'nb_available' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookE, 'codeQR' => 'QR-LIB2-E-001', 'condition' => 'nouvelle',  'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
            ['book_id' => $bookE, 'codeQR' => 'QR-LIB2-E-002', 'condition' => 'bon', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Livre F : Programmation
        $bookF = DB::table('books')->insertGetId([
            'library_id' => $lib2,
            'title' => 'Clean Code',
            'author' => 'Robert C. Martin',
            'genre_id' => $genreProg,
            'isbn' => '9780132350884',
            'description' => 'Les bonnes pratiques pour écrire du code propre et maintenable.',
            'year_of_publication' => 2008,
            'nb_copy' => 1,
            'nb_available' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookF, 'codeQR' => 'QR-LIB2-F-001', 'condition' => 'nouvelle', 'status' => 'disponible', 'date_added' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ── Prêt actif sur Livre C (lecteur1, en cours) ───────────────────────
        $lecteur1Id = DB::table('users')->where('email', 'lecteur1@digilib.test')->value('id');
        DB::table('loans')->insert([
            'user_id' => $lecteur1Id,
            'copy_id' => $copyC1,
            'status' => 'en_cours',
            'pickup_deadline' => null,
            'loan_date' => now()->subDays(5),
            'expected_return_date' => now()->addDays(9),
            'actual_return_date' => null,
            'returned_by' => null,
            'condition_on_return' => null,
            'created_at' => now()->subDays(5),
            'updated_at' => now()->subDays(5),
        ]);

        // ── Prêt en retard (lecteur en pénalité) ─────────────────────────────
        $penaliseId = DB::table('users')->where('email', 'penalise@digilib.test')->value('id');
        $copyB1 = DB::table('copies')->where('codeQR', 'QR-LIB1-B-001')->value('id');

        // L'exemplaire B est maintenant emprunté par le lecteur pénalisé
        DB::table('copies')->where('id', $copyB1)->update(['status' => 'emprunté']);
        DB::table('books')->where('id', $bookB)->decrement('nb_available');

        $loanLate = DB::table('loans')->insertGetId([
            'user_id' => $penaliseId,
            'copy_id' => $copyB1,
            'status' => 'en_cours',
            'pickup_deadline' => null,
            'loan_date' => now()->subDays(20),
            'expected_return_date' => now()->subDays(6),  // en retard de 6 jours
            'actual_return_date' => null,
            'returned_by' => null,
            'condition_on_return' => null,
            'created_at' => now()->subDays(20),
            'updated_at' => now()->subDays(20),
        ]);

        // Pénalité existante sur ce prêt (6j × 100 FCFA = 600)
        DB::table('penalties')->insert([
            'user_id' => $penaliseId,
            'loan_id' => $loanLate,
            'amount' => 600,
            'reason' => 'Retard de 6 jour(s) pour "Le Mythe de Sisyphe"',
            'status' => 'non_payé',
            'created_at' => now()->subDays(6),
            'updated_at' => now()->subDays(6),
        ]);
    }
}
