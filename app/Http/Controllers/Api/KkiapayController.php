<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use App\Models\Notification;
use App\Models\Penalty;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KkiapayController extends Controller
{
    /**
     * Vérifier une transaction (appelé par le frontend)
     */
    public function verify(Request $request)
    {
        $transactionId = $request->transactionId ?? $request->query('transaction_id');

        if (! $transactionId) {
            return response()->json(['message' => 'ID de transaction manquant'], 400);
        }

        // Appel à l'API KKiaPay pour vérifier la transaction
        // $response = Http::withHeaders([
        // $response = Http::timeout(30)->withHeaders([
       // À MODIFIER : utiliser HTTPS
$response = Http::withOptions([
    'verify' => false,
])->withHeaders([
    'x-api-key' => config('services.kkiapay.public_key'),
    'x-private-key' => config('services.kkiapay.private_key'),
    'x-secret-key' => config('services.kkiapay.secret_key'),
])->post('https://api.kkiapay.me/api/v0/verify/transaction', [
    'transactionId' => $transactionId,
]);

        $data = $response->json();

        if ($response->successful() && isset($data['status']) && $data['status'] === 'SUCCESS') {
            $transaction = Transaction::where('external_id', $transactionId)->first();

            if ($transaction) {
                $transaction->update(['status' => 'success']);

                // Mettre à jour la pénalité associée
                $this->processSuccessfulPayment($transaction);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement validé',
                    'transaction' => $transaction,
                ]);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Échec de vérification',
        ], 400);
    }

    /**
     *  WEBHOOK - Appelé automatiquement par KKiaPay après un paiement
     *
     * Cette route est appelée par les serveurs de KKiaPay
     * pour notifier votre backend qu'un paiement a été effectué.
     */
    public function handleWebhook(Request $request)
    {
        // 1. LOGGER LA REQUÊTE POUR DÉBOGAGE
        Log::info('KKiaPay Webhook reçu', [
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        // 2. VÉRIFIER LA SIGNATURE (SÉCURITÉ)
        $signature = $request->header('X-KKiaPay-Signature');

        if (! $this->isValidSignature($request->all(), $signature)) {
            Log::warning('KKiaPay Webhook : Signature invalide');

            return response()->json(['message' => 'Signature invalide'], 401);
        }

        // 3. EXTRAIRE LES DONNÉES
        $event = $request->input('event');      // 'transaction.success' ou 'transaction.failed'
        $data = $request->input('data', []);

        $transactionId = $data['transactionId'] ?? null;
        $status = $data['status'] ?? null;
        $amount = $data['amount'] ?? 0;
        $metadata = $data['metadata'] ?? [];

        if (! $transactionId) {
            Log::error('KKiaPay Webhook : TransactionId manquant');

            return response()->json(['message' => 'TransactionId manquant'], 400);
        }

        // 4. RÉCUPÉRER OU CRÉER LA TRANSACTION
        $transaction = Transaction::where('external_id', $transactionId)->first();

        if (! $transaction) {
            // Créer une nouvelle transaction si elle n'existe pas
            $transaction = Transaction::create([
                'reference' => 'KKIAPAY-'.uniqid(),
                'provider' => 'kkiapay',
                'external_id' => $transactionId,
                'amount' => $amount,
                'currency' => $data['currency'] ?? 'XOF',
                'status' => 'pending',
                'metadata' => $data,
            ]);

            Log::info('Transaction créée via webhook', ['transaction_id' => $transaction->id]);
        }

        // 5. TRAITER SELON L'ÉVÉNEMENT
        switch ($event) {
            case 'transaction.success':
            case 'TRANSACTION_SUCCESS':
                if ($status === 'SUCCESS' || $status === 'success') {
                    $transaction->update([
                        'status' => 'success',
                        'metadata' => array_merge((array) $transaction->metadata, $data),
                    ]);

                    // Traiter le paiement réussi
                    $this->processSuccessfulPayment($transaction);

                    Log::info('Paiement validé via webhook', [
                        'transaction_id' => $transaction->id,
                        'external_id' => $transactionId,
                    ]);
                }
                break;

            case 'transaction.failed':
            case 'TRANSACTION_FAILED':
                $transaction->update([
                    'status' => 'failed',
                    'metadata' => array_merge((array) $transaction->metadata, $data),
                ]);

                Log::info('Paiement échoué via webhook', [
                    'transaction_id' => $transaction->id,
                ]);
                break;

            default:
                Log::info('Événement non traité', ['event' => $event]);
        }

        // 6. RÉPONDRE À KKiaPay (IMPORTANT)
        return response()->json([
            'received' => true,
            'message' => 'Webhook traité avec succès',
        ], 200);
    }

    /**
     * Traiter un paiement réussi
     */
    private function processSuccessfulPayment(Transaction $transaction): void
    {
        // Mettre à jour la pénalité associée si elle existe
        if ($transaction->penalty_id) {
            $penalty = Penalty::find($transaction->penalty_id);

            if ($penalty && $penalty->status === 'non payé') {
                $penalty->update(['status' => 'payé']);

                // Notifier l'utilisateur
                Notification::create([
                    'user_id' => $penalty->user_id,
                    'type' => 'penalty_paid',
                    'message' => "Votre pénalité de {$penalty->amount} FCFA a été payée avec succès.",
                    'object_type' => 'penalty',
                    'object' => $penalty->id,
                    'date_sent' => now(),
                ]);

                // Si c'est une pénalité pour perte, clôturer l'emprunt
                $loan = $penalty->loan;
                if ($loan && ! $loan->actual_return_date && $penalty->reason && str_contains(strtolower($penalty->reason), 'perdu')) {
                    $loan->update([
                        'actual_return_date' => now(),
                        'status' => 'lost_settled',
                    ]);
                }
            }
        }

        // Notifier l'utilisateur du paiement réussi
        if ($transaction->user_id) {
            Notification::create([
                'user_id' => $transaction->user_id,
                'type' => 'payment_success',
                'message' => "Votre paiement de {$transaction->amount} {$transaction->currency} a été confirmé.",
                'object_type' => 'transaction',
                'object' => $transaction->id,
                'date_sent' => now(),
            ]);
        }
        // Notifier le bibliothécaire
if ($penalty && $penalty->loan && $penalty->loan->copy->book->library) {
    $librarianId = $penalty->loan->copy->book->library->administrator_id;
    
    Notification::create([
        'user_id' => $librarianId,
        'type' => 'penalty_paid_notification',
        'message' => "💰 Paiement reçu ! L'utilisateur a payé {$penalty->amount} FCFA pour la pénalité : {$penalty->reason}",
        'object_type' => 'penalty',
        'object' => $penalty->id,
        'date_sent' => now(),
    ]);
}
    }

    /**
     * Vérifier la signature du webhook (sécurité)
     */
    private function isValidSignature(array $payload, ?string $signature): bool
    {
        // En développement, on peut ignorer la vérification
        if (app()->environment('local', 'development')) {
            return true;
        }

        if (! $signature) {
            return false;
        }

        $secret = config('services.kkiapay.webhook_secret');
        if (! $secret) {
            Log::warning('KKiaPay webhook secret non configuré');

            return true; // On accepte quand même en attendant
        }

        $computedSignature = hash_hmac('sha256', json_encode($payload), $secret);

        return hash_equals($computedSignature, $signature);
    }

    /**
     * Créer une transaction pour une pénalité
     */
    public function createPaymentForPenalty(Request $request)
    {
        $request->validate([
            'penalty_id' => 'required|exists:penalties,id',
        ]);

        $user = $request->user();
        $penalty = Penalty::with('loan.copy.book')->findOrFail($request->penalty_id);

        // Vérifier que la pénalité appartient à l'utilisateur
        if ($penalty->user_id !== $user->id) {
            return response()->json(['message' => 'Cette pénalité ne vous appartient pas.'], 403);
        }

        // Vérifier que la pénalité n'est pas déjà payée
        if ($penalty->status === 'payé') {
            return response()->json(['message' => 'Cette pénalité a déjà été payée.'], 422);
        }

        // Créer une transaction en attente
        $transaction = Transaction::create([
            'user_id' => $user->id,
            'penalty_id' => $penalty->id,
            'reference' => 'PENALTY-'.$penalty->id.'-'.time(),
            'provider' => 'kkiapay',
            'amount' => $penalty->amount,
            'currency' => 'XOF',
            'status' => 'pending',
            'metadata' => [
                'penalty_reason' => $penalty->reason,
                'book_title' => $penalty->loan->copy->book->title ?? 'N/A',
            ],
        ]);

        // Retourner les infos pour initialiser KKiaPay côté frontend
        return response()->json([
            'transaction' => $transaction,
            'payment_data' => [
                'amount' => $penalty->amount,
                'currency' => 'XOF',
                'reference' => $transaction->reference,
                'description' => 'Paiement pénalité bibliothèque : '.$penalty->reason,
                'email' => $user->email,
                'phone' => $user->tel,
            ]
        ]);
    }

    /**
     * 🆕 Récupérer l'historique des transactions de l'utilisateur
     */
    public function userTransactions(Request $request)
    {
        $user = $request->user();

        $transactions = Transaction::with('penalty.loan.copy.book')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($transactions);
    }

    /**
     * 🆕 Récupérer les transactions d'une bibliothèque (Admin)
     */
    public function libraryTransactions(Request $request, $libraryId)
    {
        $user = $request->user();

        $library = Library::findOrFail($libraryId);

        if ($library->administrator_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $transactions = Transaction::with(['user', 'penalty'])
            ->whereHas('penalty.loan.copy.book', function ($q) use ($libraryId) {
                $q->where('library_id', $libraryId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($transactions);
    }
}