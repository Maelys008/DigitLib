import { useState, useEffect } from 'react';
import { X, QrCode, Download, Printer, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export default function ManageCopiesModal({ isOpen, onClose, bookId, bookTitle, bookAuthor }) {
  const [copies, setCopies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (isOpen && bookId) {
      loadCopies();
    }
  }, [isOpen, bookId]);

  const loadCopies = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBookCopies(bookId);
      setCopies(data.copies || []);
    } catch (error) {
      console.error('Erreur chargement copies:', error);
    } finally {
      setIsLoading(false);
    }
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
      case 'neuf':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Neuf</span>;
      case 'bon':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Bon</span>;
      case 'abîmé':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Abîmé</span>;
      case 'très abîmé':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Très abîmé</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{condition}</span>;
    }
  };

  const handleDownloadQR = (copy) => {
    api.downloadQRCode(copy.codeQR, `QR_${copy.codeQR}`);
  };

  const handleShowQR = (copy) => {
    setSelectedCopy(copy);
    setShowQRModal(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">📖 Exemplaires</h2>
              <p className="text-sm text-gray-500">{bookTitle} - {bookAuthor}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : copies.length === 0 ? (
              <div className="text-center py-12">
                <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun exemplaire pour ce livre</p>
              </div>
            ) : (
              <div className="space-y-3">
                {copies.map((copy) => (
                  <div key={copy.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="w-5 h-5 text-gray-600" />
                          <span className="font-mono text-sm font-semibold">{copy.codeQR}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {getConditionBadge(copy.condition)}
                          {getStatusBadge(copy.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Ajouté le {new Date(copy.date_added).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowQR(copy)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Voir QR code"
                        >
                          <QrCode className="w-5 h-5 text-purple-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadQR(copy)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Télécharger QR code"
                        >
                          <Download className="w-5 h-5 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-800">
                📌 Total : <strong>{copies.length}</strong> exemplaire(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal QR Code agrandi */}
      {showQRModal && selectedCopy && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
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
            <p className="text-center text-sm text-gray-600 mb-4 font-mono">{selectedCopy.codeQR}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  api.downloadQRCode(selectedCopy.codeQR, `QR_${selectedCopy.codeQR}`);
                  setShowQRModal(false);
                }}
                className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}