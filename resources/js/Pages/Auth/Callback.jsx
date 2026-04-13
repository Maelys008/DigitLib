import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function Callback() {
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorParam = urlParams.get('error');
      
      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setStatus('error');
        setTimeout(() => router.visit('/login'), 3000);
        return;
      }
      
      if (token) {
        setStatus('success');
        
        // Sauvegarder le token
        localStorage.setItem('auth_token', token);
        
        // Attendre un peu et récupérer l'utilisateur
        setTimeout(async () => {
          try {
            const userData = await api.getUser();
            
            if (userData && userData.user) {
              localStorage.setItem('user', JSON.stringify(userData.user));
              
              if (!userData.user.tel) {
                router.visit('/complete-profile');
              } else {
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                localStorage.removeItem('redirectAfterLogin');
                router.visit(redirectUrl || '/');
              }
            } else {
              router.visit('/login');
            }
          } catch (err) {
            console.error('Erreur:', err);
            router.visit('/login');
          }
        }, 500);
      } else {
        router.visit('/login');
      }
    };
    
    handleCallback();
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-gray-400 text-sm mt-4">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connexion en cours...</h2>
        <p className="text-gray-500">Veuillez patienter</p>
      </div>
    </div>
  );
}