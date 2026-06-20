import { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Download, Printer, CheckCircle, Clock, AlertCircle, DownloadCloud, Copy, X, ExternalLink } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import api from '../../services/api';
import JSZip from 'jszip';

export default function ManageCopies() {
  const { props } = usePage();
  const { bookId, bookTitle, bookAuthor, bookDescription } = props;
  
  const [copies, setCopies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const getQRCodeUrl = (copy, size = 250) => {
    const bookUrl = `${window.location.origin}/book/${bookId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(bookUrl)}`;
  };

  useEffect(() => {
    loadCopies();
  }, [bookId]);

  const loadCopies = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBookCopies(bookId);
      console.log('🔍 Réponse API complète:', data);
      
      if (data && data.copies) {
        setCopies(data.copies);
      } 
      else if (data && data.data && data.data.copies) {
        setCopies(data.data.copies);
      }
      else if (Array.isArray(data)) {
        setCopies(data);
      }
      else if (data && data.success === false) {
        console.error('❌ API a retourné une erreur:', data.message);
        setCopies([]);
      }
      else {
        console.warn('⚠️ Structure inattendue:', data);
        setCopies([]);
      }
    } catch (error) {
      console.error('❌ Erreur chargement copies:', error);
      setCopies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = (copy) => {
    const bookUrl = `${window.location.origin}/book/${bookId}`;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookUrl)}`;
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = `QR_${bookTitle.replace(/[^a-z0-9]/gi, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      })
      .catch(console.error);
  };

  const handleDownloadAllQRCodes = async () => {
    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      const bookUrl = `${window.location.origin}/book/${bookId}`;
      
      for (const copy of copies) {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookUrl)}`;
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`QR_${bookTitle.replace(/[^a-z0-9]/gi, '_')}.png`, blob);
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      const objectUrl = URL.createObjectURL(content);
      link.href = objectUrl;
      link.download = `QR_codes_${bookTitle.replace(/[^a-z0-9]/gi, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Erreur création ZIP:', error);
      alert('Erreur lors de la création du fichier ZIP');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const printQRCodes = () => {
    const bookUrl = `${window.location.origin}/book/${bookId}`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${bookTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-grid { display: flex; flex-wrap: wrap; gap: 20px; }
            .qr-item { text-align: center; border: 1px solid #ccc; padding: 15px; border-radius: 8px; width: 220px; }
            .qr-code img { width: 150px; height: 150px; }
            .qr-label { margin-top: 10px; font-family: monospace; font-size: 11px; word-break: break-all; }
            .book-info { margin-top: 8px; font-size: 12px; }
            .book-title { font-weight: bold; }
            .book-link { font-size: 10px; color: #0066cc; word-break: break-all; }
            @media print {
              .qr-item { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h2>${bookTitle} - ${bookAuthor}</h2>
          <div class="qr-grid">
            ${copies.map(copy => `
              <div class="qr-item">
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(bookUrl)}" />
                </div>
                <div class="book-info">
                  <div class="book-title">${bookTitle}</div>
                  <div>${bookAuthor}</div>
                  <div class="book-link">${bookUrl}</div>
                </div>
                <div class="qr-label">Exemplaire #${copy.id}</div>
              </div>
            `).join('')}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Lien copié dans le presse-papier !');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'disponible':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Disponible</span>;
      case 'emprunté':
        return <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Emprunté</span>;
      case 'perdu':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Perdu</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">{status}</span>;
    }
  };

  const getConditionBadge = (copyState) => {
    if (!copyState) {
      return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full text-xs">Non défini</span>;
    }

    const colorClasses = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    };

    const colorClass = colorClasses[copyState.color] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';

    const label = copyState.libelle_state === 'nouvelle' ? 'Neuf' :
                  copyState.libelle_state === 'bon' ? 'Bon' :
                  copyState.libelle_state === 'endommagé' ? 'Abîmé' : 'Très abîmé';

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colorClass}`}>
        {label}
      </span>
    );
  };

  const handleBack = () => {
    router.visit(`/librarian/books/${bookId}`);
  };

  const bookUrl = `${window.location.origin}/book/${bookId}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête fixe */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📖 Gestion des exemplaires</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{bookTitle} - {bookAuthor}</p>
            </div>
          </div>
        </div>

        {/* Barre d'actions */}
        {copies.length > 0 && (
          <div className="px-6 pb-4 flex gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
            <button
              onClick={handleDownloadAllQRCodes}
              disabled={isDownloadingAll}
              className="flex-1 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isDownloadingAll ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <DownloadCloud className="w-4 h-4" />
              )}
              Télécharger tous les QR (ZIP)
            </button>
            <button
              onClick={printQRCodes}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer tous les QR
            </button>
          </div>
        )}
      </div>

      {/* Liste des exemplaires */}
      <div className="p-6">
        {copies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <QrCode className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun exemplaire pour ce livre</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {copies.map((copy) => (
                <div key={copy.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                          Exemplaire #{copy.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getConditionBadge(copy.copy_state)}
                        {getStatusBadge(copy.status)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ajouté le {copy.date_added ? new Date(copy.date_added).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCopy(copy);
                          setShowQRModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Voir QR code"
                      >
                        <QrCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </button>
                      <button
                        onClick={() => handleDownloadQR(copy)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Télécharger QR code"
                      >
                        <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-sm text-purple-800 dark:text-purple-300">
                📌 Total : <strong>{copies.length}</strong> exemplaire(s)
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                💡 Les QR codes contiennent un lien direct vers la page du livre. Scannez avec votre téléphone pour accéder instantanément à la page !
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal QR Code agrandi avec LIEN CLIQUABLE */}
      {showQRModal && selectedCopy && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="flex justify-center mb-4">
              <img 
                src={getQRCodeUrl(selectedCopy, 250)}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>

            {/* LIEN CLIQUABLE DIRECTEMENT */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">🔗 Lien contenu dans le QR code :</p>
              <a
                href={bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group"
              >
                <span className="text-xs text-blue-600 dark:text-blue-400 break-all flex-1">
                  {bookUrl}
                </span>
                <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                📱 Cliquez sur le lien ou scannez le QR code pour accéder à la page du livre
              </p>
            </div>

            {/* Infos du livre */}
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">📚 Livre :</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{bookTitle}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{bookAuthor}</p>
              {bookDescription && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {bookDescription.length > 80 ? bookDescription.substring(0, 80) + '...' : bookDescription}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleDownloadQR(selectedCopy);
                  setShowQRModal(false);
                }}
                className="flex-1 bg-purple-600 dark:bg-purple-500 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger
              </button>
              <button
                onClick={() => {
                  copyToClipboard(bookUrl);
                  setShowQRModal(false);
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copier le lien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}