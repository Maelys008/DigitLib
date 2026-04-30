<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Penalty;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KkiapayController extends Controller
{
    /**
     * Initialise un paiement pour une pénalité (Frontend)
     */
    public function createPaymentForPenalty(Request $request)
    {
        $request->validate([
            'penalty_id' => 'required|exists:penalties,id',
        ]);

        $user = $request->user();
        $penalty = Penalty::with('loan.copy.book')->findOrFail($request->penalty_id);

        if ($penalty->user_id !== $user->id) {
            return response()->json(['message' => 'Cette pénalité ne vous appartient pas.'], 403);
        }

        if ($penalty->status === 'payé') {
            return response()->json(['message' => 'Cette pénalité a déjà été payée.'], 422);
        }

        // Créer une transaction locale "pending"
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'penalty_id' => $penalty->id,
            'reference' => 'PENALTY-'.$penalty->id.'-'.time(),
            'provider' => 'kkiapay',
            'amount' => $penalty->amount,
            'currency' => 'XOF',
            'status' => 'pending',
            'metadata' => json_encode([
                'penalty_id' => $penalty->id,
                'user_id' => $user->id,
            ]),
        ]);

        return response()->json([
            'transaction' => $transaction,
            'payment_data' => [
                'amount' => (int) $penalty->amount,
                'reference' => $transaction->reference,
                'description' => 'Paiement pénalité : '.($penalty->reason ?? 'Retard'),
                'email' => $user->email,
                'phone' => $user->tel,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
            ],
        ]);
    }

    /**
     * WEBHOOK - Notification automatique de Kkiapay
     */
    // public function handleWebhook(Request $request)
    // {
    //     $payload = $request->all();
    //     // Log pour debugger dans storage/logs/laravel.log
    //     Log::info('Kkiapay Payload:', $payload);

    //     $transactionId = $payload['transactionId'] ?? null;
    //     // On récupère la référence qu'on a envoyé (externalId devient client_transaction_id)
    //     $clientRef = $payload['client_transaction_id'] ?? null;

    //     if (! $clientRef) {
    //         return response()->json(['message' => 'Pas de reference'], 200);
    //     }

    //     $transaction = Transaction::where('reference', $clientRef)->first();

    //     if ($transaction) {
    //         // ON MET A JOUR L'EXTERNAL_ID ICI !
    //         $transaction->update([
    //             'external_id' => $transactionId,
    //             'payment_method' => $payload['method'] ?? 'MOBILE_MONEY',
    //         ]);

    //         // Vérification du succès (Note l'orthographe : isPaymentSucces)
    //         if (($payload['isPaymentSucces'] ?? false) == true) {
    //             $transaction->update(['status' => 'success']);
    //             $this->processSuccessfulPayment($transaction);
    //         }

    //         return response()->json(['message' => 'OK'], 200);
    //     }

    //     return response()->json(['message' => 'Transaction non trouvée'], 200);
    // }

    public function handleWebhook(Request $request)
    {
        $payload = $request->all();
        Log::info('Kkiapay Payload:', $payload);

        $transactionId = $payload['transactionId'] ?? null;
        // Kkiapay met parfois la ref dans 'externalId' ou ne la met pas du tout
        $clientRef = $payload['client_transaction_id'] ?? $payload['externalId'] ?? null;

        // Si vraiment on n'a pas de ref, on essaie de trouver par le montant et le statut pending
        if (! $clientRef) {
            $transaction = Transaction::where('status', 'pending')
                ->where('amount', $payload['amount'])
                ->latest()
                ->first();
        } else {
            $transaction = Transaction::where('reference', $clientRef)->first();
        }

        if ($transaction) {
            $transaction->update([
                'external_id' => $transactionId,
                'payment_method' => $payload['method'] ?? 'MOBILE_MONEY',
                'status' => ($payload['isPaymentSucces'] ?? false) ? 'success' : 'failed',
            ]);

            if ($transaction->status === 'success') {
                $this->processSuccessfulPayment($transaction);
            }

            return response()->json(['message' => 'OK'], 200);
        }

        return response()->json(['message' => 'Transaction introuvable'], 200);
    }
    /**
     * Vérification manuelle (Backend vers API Kkiapay)
     */
    // public function verify(Request $request, $transactionId = null)
    // {
    //     $id = $transactionId ?? $request->query('transactionId');

    //     if (! $id) {
    //         return response()->json(['success' => false, 'message' => 'ID manquant'], 400);
    //     }

    //     $response = Http::withHeaders([
    //         'x-api-key' => config('services.kkiapay.public_key'),
    //         'x-private-key' => config('services.kkiapay.private_key'),
    //         'x-secret-key' => config('services.kkiapay.secret_key'),
    //     ])->post('https://api.kkiapay.me/api/v0/verify/transaction', [
    //         'transactionId' => $id,
    //     ]);

    //     $data = $response->json();

    //     if ($response->successful() && ($data['status'] ?? '') === 'SUCCESS') {
    //         $transaction = Transaction::where('external_id', $id)
    //             ->orWhere('reference', $data['client_transaction_id'] ?? null)
    //             ->first();

    //         if ($transaction && $transaction->status !== 'success') {
    //             $transaction->update(['status' => 'success', 'external_id' => $id]);
    //             $this->processSuccessfulPayment($transaction);
    //         }

    //         return response()->json(['success' => true, 'transaction' => $transaction]);
    //     }

    //     return response()->json(['success' => false], 400);
    // }

    public function verify(Request $request, $transactionId)
    {
        try {
            // Log pour voir si on entre bien dans la fonction
            Log::info('Vérification demandée pour : '.$transactionId);

            $response = Http::withHeaders([
                'x-api-key' => config('services.kkiapay.public_key'),
                'x-private-key' => config('services.kkiapay.private_key'),
                'x-secret-key' => config('services.kkiapay.secret_key'),
            ])->post('https://api.kkiapay.me/api/v0/verify/transaction', [
                'transactionId' => $transactionId,
            ]);

            $data = $response->json();

            if ($response->successful() && ($data['status'] ?? '') === 'SUCCESS') {
                // On cherche la transaction par l'external_id (qu'on a rempli via le webhook)
                // OU par la référence si l'external_id n'est pas encore là
                $transaction = Transaction::where('external_id', $transactionId)
                    ->orWhere('reference', $data['client_transaction_id'] ?? null)
                    ->first();

                if ($transaction && $transaction->status !== 'success') {
                    $transaction->update(['status' => 'success', 'external_id' => $transactionId]);
                    $this->processSuccessfulPayment($transaction);
                }

                return response()->json(['success' => true]);
            }

            return response()->json(['success' => false, 'message' => 'Paiement non validé par Kkiapay'], 400);

        } catch (\Exception $e) {
            Log::error('Erreur Verify: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Erreur serveur'], 500);
        }
    }

    private function processSuccessfulPayment(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            if ($transaction->penalty_id) {
                $penalty = Penalty::find($transaction->penalty_id);

                if ($penalty && $penalty->status !== 'payé') {
                    $penalty->update(['status' => 'payé']);

                    Notification::create([
                        'user_id' => $penalty->user_id,
                        'type' => 'penalty_paid',
                        'message' => "Votre pénalité de {$penalty->amount} FCFA a été réglée avec succès.",
                        'object_type' => 'penalty',
                        'object' => $penalty->id,
                        'date_sent' => now(),
                    ]);

                    // Gestion des livres perdus
                    $loan = $penalty->loan;
                    if ($loan && ! $loan->actual_return_date && str_contains(strtolower($penalty->reason ?? ''), 'perdu')) {
                        $loan->update([
                            'actual_return_date' => now(),
                            'status' => 'lost_settled',
                        ]);
                    }
                }
            }
        });
    }
}
