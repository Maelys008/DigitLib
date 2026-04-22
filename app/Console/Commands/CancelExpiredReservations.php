<?php

namespace App\Console\Commands;

use App\Models\Copy;
use App\Models\Reservation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelExpiredReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reservations:cancel-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Annule les réservations non réclamées après 24h et libère le livre pour le suivant';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Trouver les réservations notifiées qui ont expiré
        $expiredReservations = Reservation::where('status', 'notified')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expiredReservations as $res) {
            DB::transaction(function () use ($res) {
                // Annuler la réservation actuelle
                $res->update(['status' => 'expired']);

                // Trouver l'exemplaire qui était bloqué
                $copy = Copy::where('book_id', $res->book_id)
                    ->where('status', 'réservé')
                    ->first();

                if ($copy) {
                    // Chercher s'il y a quelqu'un d'autre en attente
                    $nextRes = Reservation::where('book_id', $res->book_id)
                        ->where('status', 'active')
                        ->orderBy('created_at', 'asc')
                        ->first();

                    if ($nextRes) {
                        // On transfère le livre au suivant
                        $nextRes->update([
                            'status' => 'notified',
                            'expires_at' => now()->addHours(24),
                        ]);
                        // Le statut du livre reste 'réservé'
                    } else {
                        // Personne d'autre ? Le livre redevient disponible pour tous
                        $copy->update(['status' => 'disponible']);
                        $copy->book->increment('nb_available');
                    }
                }
            });
            $this->info(count($expiredReservations).' réservations expirées traitées.');
        }

    }
}
