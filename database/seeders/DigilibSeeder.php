<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DigilibSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // TRUNCATE (ordre important)
        DB::table('users')->truncate();
        DB::table('badges')->truncate();
        DB::table('libraries')->truncate();
        DB::table('books')->truncate();
        DB::table('copies')->truncate();
        DB::table('inscriptions')->truncate();
        DB::table('loans')->truncate();
        DB::table('reservations')->truncate();
        DB::table('roles')->truncate();
        DB::table('internal_members')->truncate();
        DB::table('role_assignments')->truncate();
        DB::table('personal_access_tokens')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        /*
        |--------------------------------------------------------------------------
        | BADGES
        |--------------------------------------------------------------------------
        */
        DB::table('badges')->insert([
            ['id' => 1, 'name' => 'Bronze', 'condition_of_obtaining' => 0, 'maximum_book' => 2, 'created_at' => '2026-03-23 07:42:50', 'updated_at' => null],
            ['id' => 2, 'name' => 'Argent', 'condition_of_obtaining' => 100, 'maximum_book' => 5, 'created_at' => '2026-03-23 07:42:50', 'updated_at' => null],
            ['id' => 3, 'name' => 'Or', 'condition_of_obtaining' => 500, 'maximum_book' => 10, 'created_at' => '2026-03-23 07:42:50', 'updated_at' => null],
            ['id' => 4, 'name' => 'Platine', 'condition_of_obtaining' => 1000, 'maximum_book' => 20, 'created_at' => '2026-03-23 07:42:50', 'updated_at' => null],
            ['id' => 5, 'name' => 'Diamant', 'condition_of_obtaining' => 5000, 'maximum_book' => 50, 'created_at' => '2026-03-23 07:42:50', 'updated_at' => null],
            ['id' => 6, 'name' => 'Légendaire', 'condition_of_obtaining' => 10000, 'maximum_book' => 100, 'created_at' => '2026-03-23 07:42:50', 'updated_at' => null],
        ]);

        /*
        |--------------------------------------------------------------------------
        | USERS
        |--------------------------------------------------------------------------
        */
        DB::table('users')->insert([
            ['id' => 1, 'name' => 'User1', 'email' => 'maelysmoloke@gmail.com', 'tel' => '+22990000000', 'score' => 0, 'email_verified_at' => '2026-03-24 13:39:24', 'password' => '$2y$12$L/EbBUUSeMfQak6cRQmHYuMtaatIz19thZ8j.LbGRy0IYcVKLg.de', 'role' => 'admin', 'identity_hash' => '$2y$12$NrWdb1k90zkwnXLoZEoJQ.WcLAXXUOYYJadexuhc5m9Vwi.OiZ/N6', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:46:08', 'updated_at' => '2026-03-23 08:15:26', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 2, 'name' => 'User2', 'email' => 'user2@example.com', 'tel' => '+22990000001', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$sLOzJJxAo/lEzMB6vf7Vu.ICHns0Iew3YLqWk9p80dCf6n7DbFULi', 'role' => 'reader', 'identity_hash' => '$2y$12$9z.zeX3QJzkEeazS0R3waO1Sw8TV7Q4lLwT3i6xciZ.JQ99z4ZetG', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:50:50', 'updated_at' => '2026-03-23 07:51:48', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 3, 'name' => 'User3', 'email' => 'user3@example.com', 'tel' => '+22990000002', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$8mFOVo/hTI5jlEAZWkEUDuTlOs304ifxyll1ZdzI8KAQY/Imr4EZq', 'role' => 'reader', 'identity_hash' => '$2y$12$eo6Ke4JPVc6T6boKEWuYm.MW0bpR8maQE.MgOdu/sAXIcbCQsQ/ca', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:52:14', 'updated_at' => '2026-03-23 07:52:43', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 4, 'name' => 'User4', 'email' => 'user4@example.com', 'tel' => '+22990000003', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$YFy2u9rk.cb1giqUhJXTlOyXQ1E9OspdfMvB7BquHiTl7dAW1.tk6', 'role' => 'reader', 'identity_hash' => '$2y$12$nb2zrwaEXtNVombaZoryA.UfDMhY4pBLmgSRlLogW3Oe7LJypBw/m', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:52:59', 'updated_at' => '2026-03-23 07:53:29', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 5, 'name' => 'User5', 'email' => 'user5@example.com', 'tel' => '+22990000004', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$5Beac9NCeIJDTFFppTNPauh/x058ufIvoagRYJSjEe.l7DN2.xjqG', 'role' => 'reader', 'identity_hash' => '$2y$12$lykSfCKRf249At4nQKHmPuORepf4XCN.vrDmtlDfMmtACv0GvCxW.', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:53:55', 'updated_at' => '2026-03-23 07:54:24', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 6, 'name' => 'User6', 'email' => 'user6@example.com', 'tel' => '+22990000005', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$UoW8beXZ0tonvKBEAaw5M.Nav34rZFx.TFHPIaYYllpm2F0Pyozfa', 'role' => 'reader', 'identity_hash' => '$2y$12$RpFzaAOXWuhJJ/hfyp2F5.BlJNQOd6YKFRSuxLpUcM98pwPEW5uPe', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:54:34', 'updated_at' => '2026-03-23 07:54:56', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 7, 'name' => 'User8', 'email' => 'user7@example.com', 'tel' => '+22990000023', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$pGtquBzHTucVNUUtnipw8OSmeNDz4.zAIOlJaEz7f2CwPQSNP5dlm', 'role' => 'reader', 'identity_hash' => '$2y$12$hgU.shVlu2qyGWDOq4WdweU2uVsPO9wMqUzbaT4L5Nq.6mk/KT7Uy', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 07:55:04', 'updated_at' => '2026-03-23 11:13:49', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 10, 'name' => 'Rosmiyath', 'email' => 'rosmiros52@gmail.com', 'tel' => '+22990000034', 'score' => 0, 'email_verified_at' => null, 'password' => '$2y$12$t9RzcnPsARfmOps0ix9BX.Mbe1YOHTp6xQmSm./IbCuRqCswqZF8K', 'role' => 'reader', 'identity_hash' => '$2y$12$1xE3vvoMvQH5HtV68ppqBu05.q/Nd1zhLTqyIBp6.IO9L7C/xoj2a', 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-23 11:12:31', 'updated_at' => '2026-03-23 11:27:59', 'otp_code' => null, 'otp_expires_at' => null],
            ['id' => 11, 'name' => null, 'email' => 'momomoloke008@gmail.com', 'tel' => null, 'score' => 0, 'email_verified_at' => '2026-03-24 08:08:16', 'password' => '$2y$12$KWYBLfH9V1neFSRtIWRBPefllojp/Zghhh9929EPmw1mpJDciJWrq', 'role' => 'reader', 'identity_hash' => null, 'status' => 'active', 'badge_id' => null, 'remember_token' => null, 'created_at' => '2026-03-24 08:07:08', 'updated_at' => '2026-03-24 08:08:16', 'otp_code' => null, 'otp_expires_at' => null],
        ]);

        /*
        |--------------------------------------------------------------------------
        | LIBRARIES
        |--------------------------------------------------------------------------
        */
        DB::table('libraries')->insert([
            ['id' => 3, 'name' => 'Bibliothèque Nationale du Bénin', 'adress' => 'Cotonou, Avenue Steinmetz', 'description' => 'La plus grande bibliothèque du pays avec plus de 50 000 ouvrages', 'parent_id' => null, 'administrator_id' => 1, 'library_image' => 'library_images/fHPBiNs4X7yXoQ1cXabEfeKBr2OWNXkQdI8pSG9H.jpg', 'created_at' => '2026-03-23 08:15:26', 'updated_at' => '2026-03-23 08:15:26', 'loan_duration' => 14, 'daily_penalty_amount' => 0],
            ['id' => 4, 'name' => 'Annexe Nationale - Akpakpa', 'adress' => 'Cotonou, Akpakpa', 'description' => 'Annexe de la Bibliothèque Nationale', 'parent_id' => 3, 'administrator_id' => 1, 'library_image' => null, 'created_at' => '2026-03-23 08:21:59', 'updated_at' => '2026-03-23 08:21:59', 'loan_duration' => 14, 'daily_penalty_amount' => 0],
        ]);


        /*
        |--------------------------------------------------------------------------
        | BOOKS
        |--------------------------------------------------------------------------
        */
        DB::table('books')->insert([
            ['id' => 7, 'library_id' => 3, 'title' => "Introduction à l'Intelligence Artificielle", 'author' => 'Stuart Russell', 'genre' => 'Sciences', 'isbn' => '978-0-134-61099-3', 'description' => 'Ce livre est une référence incontournable pour comprendre les bases de l’intelligence artificielle.', 'year_of_publication' => '2020-08-10 00:00:00', 'cover_image' => 'covers/pi38HRjAOuqDgSsk6vLeqaYsu1lSM8I3ATIVqZH4.jpg', 'nb_copy' => 1, 'nb_available' => 0, 'created_at' => '2026-03-23 09:21:30', 'updated_at' => '2026-03-23 09:38:01'],
            ['id' => 8, 'library_id' => 3, 'title' => 'Une si longue lettre', 'author' => 'Mariama Bâ', 'genre' => 'Roman', 'isbn' => '978-2-070-40444-9', 'description' => 'Ce roman prend la forme d’une longue lettre.', 'year_of_publication' => '1979-08-10 00:00:00', 'cover_image' => 'covers/n32QZqRwklC89OmrfhVmXpXIGWFvPDHvKVLVMEIW.jpg', 'nb_copy' => 2, 'nb_available' => 1, 'created_at' => '2026-03-23 09:22:37', 'updated_at' => '2026-03-23 09:38:15'],
            ['id' => 9, 'library_id' => 3, 'title' => "Histoire du Royaume d'Abomey", 'author' => 'Edna G. Bay', 'genre' => 'Histoire', 'isbn' => '978-0-852-55548-5', 'description' => 'Ce livre retrace l’histoire du royaume d’Abomey.', 'year_of_publication' => '1998-08-10 00:00:00', 'cover_image' => 'covers/3ypI0XQdu2SsBm59n3MIbl5Qp9XH4EMTiAxssqhR.jpg', 'nb_copy' => 2, 'nb_available' => 2, 'created_at' => '2026-03-23 09:42:54', 'updated_at' => '2026-03-23 09:42:54'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | COPIES
        |--------------------------------------------------------------------------
        */
        DB::table('copies')->insert([
            ['id' => 1, 'book_id' => 7, 'codeQR' => 'QR-2ULHCFDZ', 'book_status' => 'neuf', 'status' => 'emprunté', 'date_added' => '2026-03-23', 'created_at' => '2026-03-23 09:21:30', 'updated_at' => '2026-03-23 09:38:01'],
            ['id' => 2, 'book_id' => 8, 'codeQR' => 'QR-IM8DHTZH', 'book_status' => 'neuf', 'status' => 'emprunté', 'date_added' => '2026-03-23', 'created_at' => '2026-03-23 09:22:37', 'updated_at' => '2026-03-23 09:38:15'],
            ['id' => 3, 'book_id' => 8, 'codeQR' => 'QR-ZO9PV2FE', 'book_status' => 'neuf', 'status' => 'disponible', 'date_added' => '2026-03-23', 'created_at' => '2026-03-23 09:22:37', 'updated_at' => '2026-03-23 09:22:37'],
            ['id' => 4, 'book_id' => 9, 'codeQR' => 'QR-IU4CQOFN', 'book_status' => 'neuf', 'status' => 'disponible', 'date_added' => '2026-03-23', 'created_at' => '2026-03-23 09:42:54', 'updated_at' => '2026-03-23 09:42:54'],
            ['id' => 5, 'book_id' => 9, 'codeQR' => 'QR-4GZB4UA0', 'book_status' => 'neuf', 'status' => 'disponible', 'date_added' => '2026-03-23', 'created_at' => '2026-03-23 09:42:54', 'updated_at' => '2026-03-23 09:42:54'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | INSCRIPTIONS
        |--------------------------------------------------------------------------
        */
        DB::table('inscriptions')->insert([
            ['id' => 3, 'user_id' => 1, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:15:26', 'updated_at' => '2026-03-23 08:15:26'],
            ['id' => 4, 'user_id' => 1, 'library_id' => 4, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:21:59', 'updated_at' => '2026-03-23 08:21:59'],
            ['id' => 5, 'user_id' => 7, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:23:44', 'updated_at' => '2026-03-23 08:23:44'],
            ['id' => 6, 'user_id' => 2, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:27:31', 'updated_at' => '2026-03-23 08:27:31'],
            ['id' => 8, 'user_id' => 4, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:27:52', 'updated_at' => '2026-03-23 08:27:52'],
            ['id' => 9, 'user_id' => 5, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:28:00', 'updated_at' => '2026-03-23 08:28:00'],
            ['id' => 10, 'user_id' => 6, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 08:28:11', 'updated_at' => '2026-03-23 08:28:11'],
            ['id' => 11, 'user_id' => 3, 'library_id' => 3, 'date' => '2026-03-23', 'created_at' => '2026-03-23 09:50:08', 'updated_at' => '2026-03-23 09:50:08'],
        ]);


        /*
        |--------------------------------------------------------------------------
        | LOANS
        |--------------------------------------------------------------------------
        */
        DB::table('loans')->insert([
            ['id' => 1, 'user_id' => 2, 'copy_id' => 1, 'loan_date' => '2026-03-23', 'expected_return_date' => '2026-04-06', 'actual_return_date' => null, 'created_at' => '2026-03-23 09:38:01', 'updated_at' => '2026-03-23 09:38:01'],
            ['id' => 2, 'user_id' => 2, 'copy_id' => 2, 'loan_date' => '2026-03-23', 'expected_return_date' => '2026-04-06', 'actual_return_date' => null, 'created_at' => '2026-03-23 09:38:15', 'updated_at' => '2026-03-23 09:38:15'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | RESERVATIONS
        |--------------------------------------------------------------------------
        */
        DB::table('reservations')->insert([
            ['id' => 1, 'user_id' => 3, 'book_id' => 7, 'status' => 'active', 'created_at' => '2026-03-23 09:50:18', 'updated_at' => '2026-03-23 09:50:18'],
            ['id' => 2, 'user_id' => 4, 'book_id' => 7, 'status' => 'active', 'created_at' => '2026-03-23 09:51:52', 'updated_at' => '2026-03-23 09:51:52'],
        ]);
        /*
        |--------------------------------------------------------------------------
        | ROLES
        |--------------------------------------------------------------------------
        */
         DB::table('roles')->insert([
            ['name_role' => 'Super Admin', 'permissions' => 'all,manage_system', 'created_at' => now()],
            ['name_role' => 'Staff', 'permissions' => 'manage_books,manage_loans', 'created_at' => now()],            
            ['name_role' => 'Librarian', 'permissions' => 'all', 'created_at' => now()],
            ['name_role' => 'Administrator', 'permissions' => 'all,manage_users,manage_libraries', 'created_at' => now()],
            ['name_role' => 'Reader', 'permissions' => 'borrow_books,join_clubs', 'created_at' => now()],
            ['name_role' => 'Club Moderator', 'permissions' => 'manage_clubs,moderate_messages', 'created_at' => now()],
        ]);



        /*
        |--------------------------------------------------------------------------
        | INTERNAL MEMBERS
        |--------------------------------------------------------------------------
        */
        DB::table('internal_members')->insert([
            ['id' => 3, 'user_id' => 1, 'library_id' => 3, 'created_at' => '2026-03-23 08:15:26', 'updated_at' => '2026-03-23 08:15:26'],
            ['id' => 4, 'user_id' => 1, 'library_id' => 4, 'created_at' => '2026-03-23 08:21:59', 'updated_at' => '2026-03-23 08:21:59'],
            ['id' => 5, 'user_id' => 2, 'library_id' => 3, 'created_at' => '2026-03-23 08:27:31', 'updated_at' => '2026-03-23 08:27:31'],
            ['id' => 6, 'user_id' => 3, 'library_id' => 3, 'created_at' => '2026-03-23 08:27:43', 'updated_at' => '2026-03-23 08:27:43'],
            ['id' => 7, 'user_id' => 4, 'library_id' => 3, 'created_at' => '2026-03-23 08:27:52', 'updated_at' => '2026-03-23 08:27:52'],
            ['id' => 8, 'user_id' => 5, 'library_id' => 3, 'created_at' => '2026-03-23 08:28:00', 'updated_at' => '2026-03-23 08:28:00'],
            ['id' => 9, 'user_id' => 6, 'library_id' => 3, 'created_at' => '2026-03-23 08:28:11', 'updated_at' => '2026-03-23 08:28:11'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | ROLE ASSIGNMENTS
        |--------------------------------------------------------------------------
        */
        DB::table('role_assignments')->insert([
            ['id' => 3, 'internal_member_id' => 3, 'role_id' => 1, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:15:26', 'updated_at' => '2026-03-23 08:15:26'],
            ['id' => 4, 'internal_member_id' => 4, 'role_id' => 1, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:21:59', 'updated_at' => '2026-03-23 08:21:59'],
            ['id' => 5, 'internal_member_id' => 5, 'role_id' => 2, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:27:31', 'updated_at' => '2026-03-23 08:27:31'],
            ['id' => 6, 'internal_member_id' => 6, 'role_id' => 3, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:27:43', 'updated_at' => '2026-03-23 08:27:43'],
            ['id' => 7, 'internal_member_id' => 7, 'role_id' => 4, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:27:52', 'updated_at' => '2026-03-23 08:27:52'],
            ['id' => 8, 'internal_member_id' => 8, 'role_id' => 5, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:28:00', 'updated_at' => '2026-03-23 08:28:00'],
            ['id' => 9, 'internal_member_id' => 9, 'role_id' => 6, 'date_assignment' => '2026-03-23', 'created_at' => '2026-03-23 08:28:11', 'updated_at' => '2026-03-23 08:28:11'],
        ]);
    }
}
