<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {

        DB::table('users')->insert([
            [
                'id' => 1,
                'name' => 'User1',
                'email' => 'user1@gmail.com',
                'tel' => '+22990000001',
                'score' => 0,
                'email_verified_at' => '2026-03-24 13:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$NrWdb1k90zkwnXLoZEoJQ.WcLAXXUOYYJadexuhc5m9Vwi.OiZ/N6',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:46:08',
                'updated_at' => '2026-03-23 08:15:26',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 2,
                'name' => 'User2',
                'email' => 'user2@example.com',
                'tel' => '+22990000002',
                'score' => 0,
                'email_verified_at' => '2026-03-24 12:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$9z.zeX3QJzkEeazS0R3waO1Sw8TV7Q4lLwT3i6xciZ.JQ99z4ZetG',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:50:50',
                'updated_at' => '2026-03-23 07:51:48',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 3,
                'name' => 'User3',
                'email' => 'user3@example.com',
                'tel' => '+22990000003',
                'score' => 0,
                'email_verified_at' => '2026-03-24 11:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$eo6Ke4JPVc6T6boKEWuYm.MW0bpR8maQE.MgOdu/sAXIcbCQsQ/ca',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:52:14',
                'updated_at' => '2026-03-23 07:52:43',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 4,
                'name' => 'User4',
                'email' => 'user4@example.com',
                'tel' => '+22990000004',
                'score' => 0,
                'email_verified_at' => '2026-03-24 10:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$nb2zrwaEXtNVombaZoryA.UfDMhY4pBLmgSRlLogW3Oe7LJypBw/m',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:52:59',
                'updated_at' => '2026-03-23 07:53:29',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 5,
                'name' => 'User5',
                'email' => 'user5@example.com',
                'tel' => '+22990000005',
                'score' => 0,
                'email_verified_at' => '2026-03-24 22:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$lykSfCKRf249At4nQKHmPuORepf4XCN.vrDmtlDfMmtACv0GvCxW.',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:53:55',
                'updated_at' => '2026-03-23 07:54:24',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 6,
                'name' => 'User6',
                'email' => 'user6@example.com',
                'tel' => '+22990000006',
                'score' => 0,
                'email_verified_at' => '2026-03-24 21:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$RpFzaAOXWuhJJ/hfyp2F5.BlJNQOd6YKFRSuxLpUcM98pwPEW5uPe',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:54:34',
                'updated_at' => '2026-03-23 07:54:56',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 7,
                'name' => 'User7',
                'email' => 'user7@example.com',
                'tel' => '+22990000007',
                'score' => 0,
                'email_verified_at' => '2026-03-24 13:50:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$hgU.shVlu2qyGWDOq4WdweU2uVsPO9wMqUzbaT4L5Nq.6mk/KT7Uy',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 07:55:04',
                'updated_at' => '2026-03-23 11:13:49',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
            [
                'id' => 8,
                'name' => 'User_',
                'email' => 'user_@example.com',
                'tel' => '+22990000008',
                'score' => 0,
                'email_verified_at' => '2026-03-24 13:39:24',
                'password' => Hash::make('password'),
                'role' => 'reader',
                'identity_hash' => '$2y$12$1xE3vvoMvQH5HtV68ppqBu05.q/Nd1zhLTqyIBp6.IO9L7C/xoj2a',
                'status' => 'active',
                'badge_id' => null,
                'remember_token' => null,
                'created_at' => '2026-03-23 11:12:31',
                'updated_at' => '2026-03-23 11:27:59',
                'otp_code' => null,
                'otp_expires_at' => null
            ],
        ]);
    }
}
