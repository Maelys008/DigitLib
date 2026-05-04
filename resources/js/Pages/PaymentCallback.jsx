import { useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import { CheckCircle } from "lucide-react";

export default function PaymentCallback() {
    const { props } = usePage();
    const { transactionId: propsTransactionId } = props;
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlTransactionId = urlParams.get('transaction_id');
    const transactionId = propsTransactionId || urlTransactionId;

    useEffect(() => {
        // Récupérer le token
        const token = localStorage.getItem("auth_token");
        
        // Appel API silencieux en arrière-plan
        if (token && transactionId) {
            fetch(`/api/verify-payment/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }).catch(err => console.error('Erreur:', err));
        }
        
        // Redirection après 1.5 secondes
        const timeout = setTimeout(() => {
            router.visit("/profile/cards");
        }, 1500);
        
        return () => clearTimeout(timeout);
    }, [transactionId]);

    // Afficher directement le succès
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Paiement réussi ! ✅
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Merci pour votre paiement.
                </p>
            </div>
        </div>
    );
}