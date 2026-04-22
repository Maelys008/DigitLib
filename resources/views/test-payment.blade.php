<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test KKiaPay</title>
    <script src="https://cdn.kkiapay.me/k.js"></script>
</head>
<body>
    <div style="text-align: center; margin-top: 50px;">
        <h2>Tester mon intégration KKiaPay</h2>
        
        <p>Ma clé chargée est : <strong>{{ config('services.kkiapay.public_key') }}</strong></p>

        <kkiapay-widget 
            sandbox="true" 
            amount="1000" 
            key="{{ config('services.kkiapay.public_key') }}"
            callback="{{ url('/verify-payment') }}">
        </kkiapay-widget>

        <hr>

        <button type="button" onclick="lancerPaiement()">Payer avec mon bouton perso</button>
    </div>

    <script>
        function lancerPaiement() {
            console.log("Lancement du widget...");
            openKkiapayWidget({
                amount: 1000,
                position: "center",
                sandbox: true,
                key: "{{ config('services.kkiapay.public_key') }}",
                data: "COMMANDE_123"
            });
        }

        // Ecouteur de succès pour le bouton perso
        addKkiapayListener('payment_success', (response) => {
            console.log("Succès transaction:", response.transactionId);
            window.location.href = "/verify-payment/" + response.transactionId;
        });

        addKkiapayListener('payment_error', (error) => {
            console.error("Erreur détaillée:", error);
        });
    </script>
</body>
</html>