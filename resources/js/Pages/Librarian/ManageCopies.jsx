import { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Download, Printer, CheckCircle, Clock, AlertCircle, DownloadCloud, Copy, X } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import api from '../../services/api';
import JSZip from 'jszip';

export default function ManageCopies() {
  const { props } = usePage();
  const { bookId, bookTitle, bookAuthor } = props;
  
  const [copies, setCopies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  useEffect(() => {
    loadCopies();
  }, [bookId]);

const loadCopies = async () => {
  setIsLoading(true);
  try {
    const data = await api.getBookCopies(bookId);
    console.log('🔍 Réponse API complète:', data);
    
    // Vérifie différentes structures possibles
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
    api.downloadQRCode(copy.codeQR, `QR_${copy.codeQR}`);
  };

  const handleDownloadAllQRCodes = async () => {
    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      
      for (const copy of copies) {
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(copy.codeQR)}`;
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(`QR_${copy.codeQR}.png`, blob);
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
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${bookTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .qr-grid { display: flex; flex-wrap: wrap; gap: 20px; }
            .qr-item { text-align: center; border: 1px solid #ccc; padding: 15px; border-radius: 8px; width: 180px; }
            .qr-code img { width: 150px; height: 150px; }
            .qr-label { margin-top: 10px; font-family: monospace; font-size: 12px; }
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
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(copy.codeQR)}" />
                </div>
                <div class="qr-label">${copy.codeQR}</div>
              </div>
            `).join('')}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const copyToClipboard = (codeQR) => {
    navigator.clipboard.writeText(codeQR);
    alert(`QR code "${codeQR}" copié dans le presse-papier !`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'disponible':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Disponible</span>;
      case 'emprunté':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Emprunté</span>;
      case 'perdu':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Perdu</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'neuf': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Neuf</span>;
      case 'bon': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Bon</span>;
      case 'abîmé': return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Abîmé</span>;
      case 'très abîmé': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Très abîmé</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{condition}</span>;
    }
  };

  const handleBack = () => {
    router.visit(`/librarian/books/${bookId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête fixe */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📖 Gestion des exemplaires</h1>
              <p className="text-sm text-gray-500 mt-1">{bookTitle} - {bookAuthor}</p>
            </div>
          </div>
        </div>

        {/* Barre d'actions - TOUJOURS VISIBLE */}
        {copies.length > 0 && (
          <div className="px-6 pb-4 flex gap-3 border-t border-gray-100 pt-4">
            <button
              onClick={handleDownloadAllQRCodes}
              disabled={isDownloadingAll}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
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
          <div className="text-center py-12 bg-white rounded-xl">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun exemplaire pour ce livre</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {copies.map((copy) => (
                <div key={copy.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-purple-600" />
                        <span className="font-mono text-base font-bold text-gray-800">{copy.codeQR}</span>
                        <button
                          onClick={() => copyToClipboard(copy.codeQR)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="Copier le code"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {getConditionBadge(copy.condition)}
                        {getStatusBadge(copy.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        Ajouté le {copy.date_added ? new Date(copy.date_added).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCopy(copy);
                          setShowQRModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir QR code"
                      >
                        <QrCode className="w-5 h-5 text-purple-600" />
                      </button>
                      <button
                        onClick={() => handleDownloadQR(copy)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Télécharger QR code"
                      >
                        <Download className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-800">
                📌 Total : <strong>{copies.length}</strong> exemplaire(s)
              </p>
              <p className="text-xs text-purple-600 mt-1">
                💡 Astuce : Cliquez sur "Télécharger tous les QR" pour obtenir un fichier ZIP avec tous les QR codes.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal QR Code agrandi */}
      {showQRModal && selectedCopy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">QR Code</h3>
              <button onClick={() => setShowQRModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(selectedCopy.codeQR)}`}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
            <p className="text-center text-sm text-gray-600 mb-4 font-mono break-all">{selectedCopy.codeQR}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  handleDownloadQR(selectedCopy);
                  setShowQRModal(false);
                }}
                className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger
              </button>
              <button
                onClick={() => {
                  copyToClipboard(selectedCopy.codeQR);
                  setShowQRModal(false);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}