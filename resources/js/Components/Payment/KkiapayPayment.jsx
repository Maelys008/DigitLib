import { useState } from "react";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";

export default function KkiapayPayment({
    penalty,
    onSuccess,
    onClose,
    isOpen,
}) {
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    //   const handlePayment = async () => {
    //     if (!penalty) return;

    //     setStatus('loading');
    //     setErrorMessage('');

    //     try {
    //       const response = await fetch('/api/payments/create-for-penalty', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
    //         },
    //         body: JSON.stringify({ penalty_id: penalty.id })
    //       });

    //       const data = await response.json();

    //       if (!response.ok) {
    //         throw new Error(data.message || 'Erreur lors de la création du paiement');
    //       }

    //       const transaction = data.transaction;
    //       const paymentData = data.payment_data;

    //   // Ajoute callback_url dans l'URL
    // const paymentUrl = `https://app.kkiapay.me/payment?amount=${penalty.amount}&currency=XOF&reference=${transaction.reference}&key=${import.meta.env.VITE_KKIAPAY_PUBLIC_KEY}&description=${encodeURIComponent(paymentData.description)}&phone=${paymentData.phone}&email=${paymentData.email}&sandbox=true&callback_url=${window.location.origin}/payment-callback`;

    //       console.log('🔗 URL de paiement:', paymentUrl);

    //       // Rediriger directement
    //       window.location.href = paymentUrl;

    //     } catch (error) {
    //       console.error('Erreur:', error);
    //       setStatus('error');
    //       setErrorMessage(error.message || 'Erreur lors du paiement');
    //     }
    //   };

    const handlePayment = async () => {
        if (!penalty) return;

        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/payments/create-for-penalty", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("auth_token"),
                },
                body: JSON.stringify({ penalty_id: penalty.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de la création du paiement",
                );
            }

            const transaction = data.transaction;
            const paymentData = data.payment_data;

            const paymentUrl = `https://app.kkiapay.me/payment?amount=${penalty.amount}&currency=XOF&reference=${transaction.reference}&key=${import.meta.env.VITE_KKIAPAY_PUBLIC_KEY}&description=${encodeURIComponent(paymentData.description)}&name=${encodeURIComponent(paymentData.name || "")}&phone=${paymentData.phone}&email=${paymentData.email}&callback_url=${encodeURIComponent(window.location.origin + "/payment-callback")}`;

            // Pour le sandbox, ajouter &sandbox=true
            const finalUrl =
                import.meta.env.VITE_KKIAPAY_SANDBOX === "true"
                    ? paymentUrl + "&sandbox=true"
                    : paymentUrl;

            console.log("🔗 URL de paiement:", finalUrl);

            // Rediriger directement
            window.location.href = finalUrl;
        } catch (error) {
            console.error("Erreur:", error);
            setStatus("error");
            setErrorMessage(error.message || "Erreur lors du paiement");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Paiement de pénalité
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {penalty?.reason || "Pénalité de retard"}
                        </p>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300">
                                Montant à payer :
                            </span>
                            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {penalty?.amount?.toLocaleString()} FCFA
                            </span>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    {status === "success" && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span>Paiement effectué avec succès !</span>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => onClose?.()}
                            disabled={status === "loading"}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={
                                status === "loading" || status === "success"
                            }
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {status === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Chargement...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Payer {penalty?.amount?.toLocaleString()}{" "}
                                    FCFA
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
