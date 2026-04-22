<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LibraryAndBookSeeder extends Seeder
{
    public function run(): void
    {
        // Bibliothèque 1
        $libId1 = DB::table('libraries')->insertGetId([
            'name' => 'Bibliothèque Centrale',
            'adress' => 'Rue de la Science, Cotonou',
            'administrator_id' => 1,
            'created_at' => now(),
        ]);
        $bookId1 = DB::table('books')->insertGetId([
            'library_id' => $libId1,
            'title' => 'L’Étranger',
            'author' => 'Albert Camus',
            'genre' => 'Roman',
            'isbn' => '9782070360024',
            'year_of_publication' => 1942,
            'cover_image' => 'camus.jpg',
            'nb_copy' => 2,
            'nb_available' => 2,
            'created_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookId1, 'codeQR' => 'QR001', 'book_status' => 'neuf', 'status' => 'disponible', 'date_added' => now()],
            ['book_id' => $bookId1, 'codeQR' => 'QR002', 'book_status' => 'bon état', 'status' => 'disponible', 'date_added' => now()],
        ]);

        // Bibliothèque 2
        $libId2 = DB::table('libraries')->insertGetId([
            'name' => 'Bibliothèque Universitaire',
            'adress' => 'Campus de Godomey',
            'administrator_id' => 1,
            'parent_id' => 1,
            'created_at' => now(),
        ]);
        $bookId2 = DB::table('books')->insertGetId([
            'library_id' => $libId2,
            'title' => '1984',
            'author' => 'George Orwell',
            'genre' => 'Dystopie',
            'isbn' => '9782266208995',
            'year_of_publication' => 1949,
            'cover_image' => 'orwell.jpg',
            'nb_copy' => 3,
            'nb_available' => 3,
            'created_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookId2, 'codeQR' => 'QR003', 'book_status' => 'neuf', 'status' => 'disponible', 'date_added' => now()],
            ['book_id' => $bookId2, 'codeQR' => 'QR004', 'book_status' => 'bon état', 'status' => 'disponible', 'date_added' => now()],
            ['book_id' => $bookId2, 'codeQR' => 'QR005', 'book_status' => 'excellent', 'status' => 'disponible', 'date_added' => now()],
        ]);

        // Bibliothèque 3
        $libId3 = DB::table('libraries')->insertGetId([
            'name' => 'Bibliothèque des Enfants',
            'adress' => 'Akpakpa, Cotonou',
            'administrator_id' => 1,
            'created_at' => now(),
        ]);
        $bookId3 = DB::table('books')->insertGetId([
            'library_id' => $libId3,
            'title' => 'Le Petit Prince',
            'author' => 'Antoine de Saint-Exupéry',
            'genre' => 'Conte',
            'isbn' => '9782070612716',
            'year_of_publication' => 1943,
            'cover_image' => 'petitprince.jpg',
            'nb_copy' => 4,
            'nb_available' => 4,
            'created_at' => now(),
        ]);
        DB::table('copies')->insert([
            ['book_id' => $bookId3, 'codeQR' => 'QR006', 'book_status' => 'neuf', 'status' => 'disponible', 'date_added' => now()],
            ['book_id' => $bookId3, 'codeQR' => 'QR007', 'book_status' => 'bon état', 'status' => 'disponible', 'date_added' => now()],
            ['book_id' => $bookId3, 'codeQR' => 'QR008', 'book_status' => 'très bon', 'status' => 'disponible', 'date_added' => now()],
            ['book_id' => $bookId3, 'codeQR' => 'QR009', 'book_status' => 'excellent', 'status' => 'disponible', 'date_added' => now()],
        ]);
    }
}
