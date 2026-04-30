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
                theme: "#16F9F9", // Couleur orange de votre thème
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 text-center">
                <CreditCard className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Règlement de pénalité</h2>
                <p className="text-gray-500 mb-6">Montant : {penalty.amount} FCFA</p>
                
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl">Annuler</button>
                    <button 
                        onClick={handlePayment} 
                        className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold"
                    >
                        Payer maintenant
                    </button>
                </div>
            </div>
        </div>
    );
}