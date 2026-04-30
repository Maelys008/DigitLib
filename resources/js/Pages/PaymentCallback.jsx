import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback({ transactionId }) {
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let interval;

        const verifyPayment = async () => {
            try {
                const token = localStorage.getItem("auth_token");

                // On appelle le backend.
                // Note: Assurez-vous que l'URL est bien /api/verify-payment/...
                const response = await fetch(
                    `/api/verify-payment/${transactionId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    },
                );

                const data = await response.json();

                if (data.success) {
                    setStatus("success");
                    // Optionnel : Mettre à jour l'utilisateur via Inertia pour rafraîchir le header/solde
                    router.reload({ only: ["auth"] });
                } else {
                    setStatus("error");
                    setMessage(
                        "Le paiement n’a pas pu être validé par le serveur.",
                    );
                }
            } catch (error) {
                setStatus("error");
                setMessage("Erreur de connexion au serveur.");
            } finally {
                startRedirect();
            }
        };

        const startRedirect = () => {
            interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        router.visit("/profile/cards");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        verifyPayment();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [transactionId]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center shadow-xl">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Vérification en cours...
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Veuillez patienter
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Paiement réussi !
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {message}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">
                            Redirection dans {countdown} seconde
                            {countdown > 1 ? "s" : ""}...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Paiement non confirmé
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {message}
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => router.visit("/my-cards")}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                            >
                                Retour
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg"
                            >
                                Réessayer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
