// resources/js/Pages/PaymentCallback.jsx
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function PaymentCallback({ transactionId }) {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionId) {
        setStatus('error');
        setMessage('Transaction non trouvée');
        setTimeout(() => router.visit('/my-cards'), 3000);
        return;
      }

      try {
        // Vérifier la transaction via l'API
        const response = await fetch(`/api/verify-payment/${transactionId}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Paiement effectué avec succès !');
        } else {
          setStatus('error');
          setMessage('Le paiement a échoué. Veuillez réessayer.');
        }
        
        setTimeout(() => {
          router.visit('/my-cards');
        }, 3000);
        
      } catch (error) {
        console.error('Erreur:', error);
        setStatus('error');
        setMessage('Une erreur est survenue');
        setTimeout(() => {
          router.visit('/my-cards');
        }, 3000);
      }
    };
    
    verifyPayment();
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Vérification en cours...</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Veuillez patienter</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Paiement réussi !</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirection en cours...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Paiement échoué</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-4">Redirection en cours...</p>
          </>
        )}
      </div>
    </div>
  );
}