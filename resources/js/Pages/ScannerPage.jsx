import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect, useRef } from 'react';
import { ScanLine, QrCode, BookOpen, User, X, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../services/api';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannedBook, setScannedBook] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(err => console.log('Stop error:', err));
      }
    };
  }, [scanning]);

  const startScanner = async () => {
    setError(null);
    setScannedBook(null);
    setScanning(true);
    setCameraActive(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const container = document.getElementById("qr-reader");
      if (!container) {
        throw new Error("Conteneur QR reader non trouvé");
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText, decodedResult) => {
          console.log('QR Code détecté:', decodedText);
          await handleScannedCode(decodedText);
          await stopScanner();
        },
        (errorMessage) => {
          if (errorMessage && !errorMessage.includes('No MultiFormat Readers')) {
            console.log('Scan error:', errorMessage);
          }
        }
      );
    } catch (err) {
      console.error('Erreur démarrage caméra:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setScanning(false);
      setCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.log('Stop error:', err);
      }
    }
    setScanning(false);
    setCameraActive(false);
  };

  const handleScannedCode = async (code) => {
    setLoading(true);
    setScannedBook(null);
    setError(null);

    try {
      const result = await api.scanQRCode(code);
      
      if (result && result.book) {
        setScannedBook({
          id: result.book.id,
          title: result.book.title,
          author: result.book.author,
          cover: result.book.cover_image,
          nb_available: result.book.nb_available,
          library: result.book.library_name,
          status: result.status,
          message: result.message
        });
      } else {
        setError('QR code non reconnu ou livre non trouvé');
      }
    } catch (err) {
      console.error('Erreur scan:', err);
      setError('Erreur lors de la récupération des informations');
    } finally {
      setLoading(false);
    }
  };

  const goToBookDetail = () => {
    if (scannedBook) {
      router.visit(`/book/${scannedBook.id}`);
    }
  };

  const borrowBook = async () => {
    if (!scannedBook) return;
    
    setLoading(true);
    try {
      const result = await api.borrowBook(scannedBook.id);
      if (result.success) {
        if (result.isReservation) {
          alert('📖 Livre ajouté à la liste d\'attente ! Vous serez notifié quand il sera disponible.');
        } else {
          alert('✅ Livre emprunté avec succès !');
        }
        router.visit(`/book/${scannedBook.id}`);
      } else {
        alert(result.message || 'Erreur lors de l\'emprunt');
      }
    } catch (err) {
      console.error('Erreur emprunt:', err);
      alert('Erreur lors de l\'emprunt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scanner QR Code</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Scannez un QR code pour emprunter ou voir les détails</p>
            </div>
            {cameraActive && (
              <button
                onClick={stopScanner}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Zone de scan */}
          {!cameraActive ? (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white mb-6">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/40 border-dashed">
                  <QrCode className="w-24 h-24 text-white/80" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Prêt à scanner</h3>
                <p className="text-white/90 text-sm">
                  Cliquez sur "Activer la caméra" pour commencer
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-black rounded-3xl overflow-hidden mb-6">
              <div id="qr-reader" className="w-full" style={{ minHeight: '400px' }}></div>
              <div className="p-4 bg-black text-center">
                <p className="text-white text-sm flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  {scanning ? '🔍 Recherche de QR code...' : '📷 Caméra active'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Positionnez le QR code dans le cadre
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-blue-800 dark:text-blue-300 text-sm">Récupération des informations...</p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-300 text-sm font-medium">Erreur</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 dark:text-red-400 font-bold">×</button>
            </div>
          )}

          {/* Résultat du scan */}
          {scannedBook && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-green-200 dark:border-green-800 overflow-hidden animate-fade-in">
              <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 dark:text-green-400 font-medium">QR Code détecté !</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                    {scannedBook.cover ? (
                      <img src={`/storage/${scannedBook.cover}`} alt={scannedBook.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">{scannedBook.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{scannedBook.author}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${scannedBook.nb_available > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'}`}>
                        {scannedBook.nb_available > 0 ? '✅ Disponible' : '⏳ Indisponible'}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                        📚 {scannedBook.library || 'Bibliothèque'}
                      </span>
                    </div>
                    {scannedBook.message && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{scannedBook.message}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={goToBookDetail}
                        className="flex-1 bg-purple-600 dark:bg-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                      >
                        Voir détails
                      </button>
                      {scannedBook.nb_available > 0 && (
                        <button
                          onClick={borrowBook}
                          className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                        >
                          Emprunter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton activation caméra */}
          {!cameraActive && (
            <button
              onClick={startScanner}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Activer la caméra
            </button>
          )}

          {/* Types de scan */}
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Que pouvez-vous scanner ?</h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">QR Code du livre</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Scannez le QR code d'un livre pour voir ses détails et l'emprunter directement
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Carte de membre</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Scannez votre carte de membre pour accéder rapidement à votre profil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}