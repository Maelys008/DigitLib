import { useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";

export default function KkiapayPayment({ penalty, onSuccess, onClose, isOpen }) {
    
    const handlePayment = async () => {
        if (!penalty) return;

        // 1. On crée la transaction dans notre base de données via votre API existante
        try {
            const response = await fetch("/api/payments/create-for-penalty", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("auth_token"),
                },
                body: JSON.stringify({ penalty_id: penalty.id }),
            });

            const { transaction, payment_data } = await response.json();

            // 2. On lance le Widget Kkiapay
            openKkiapayWidget({
                amount: penalty.amount,
                position: "center",
                callback: `${window.location.origin}/payment-callback`, 
                data: payment_data.description,
                theme: "#EA580C", // Couleur orange pour correspondre à votre thème
                key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
                sandbox: import.meta.env.VITE_KKIAPAY_SANDBOX === "true",
                firstname: payment_data.firstname || "",
                lastname: payment_data.lastname || "",
                email: payment_data.email,
                phone: payment_data.phone,
                externalId: transaction.reference, 
            });

            // 3. Écouter le succès en JavaScript
            addKkiapayListener('success', (response) => {
                console.log("Paiement réussi via Widget:", response);
                onSuccess?.(response); // Appelle la fonction de succès passée en props
            });

        } catch (error) {
            console.error("Erreur d'initialisation:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 text-center shadow-xl">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Règlement de pénalité
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                    Montant à payer
                </p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-6">
                    {penalty?.amount?.toLocaleString()} FCFA
                </p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={handlePayment} 
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all"
                    >
                        Payer maintenant
                    </button>
                </div>
            </div>
        </div>
    );
}