
import MobileLayout from '@/Layouts/MobileLayout';
import { ScanLine, QrCode, BookOpen, User } from 'lucide-react';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ScannerPage() {
  const [cameraActive, setCameraActive] = useState(false);

  const handleActivateCamera = () => {
    setCameraActive(true);
    console.log('Caméra activée');
  };

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Scanner QR Code</h2>
          <p className="text-gray-500">Scannez un livre ou une carte de membre</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white mb-6">
          <div className="text-center">
            <div className="w-48 h-48 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/40 border-dashed">
              <QrCode className="w-24 h-24 text-white/80" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Prêt à scanner</h3>
            <p className="text-white/90 text-sm">
              Positionnez le QR code dans le cadre ci-dessus
            </p>
          </div>
        </div>

        {/* Types de scan */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">Que pouvez-vous scanner ?</h3>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">QR Code du livre</h4>
              <p className="text-sm text-gray-500">
                Scannez le QR code d'un livre pour voir ses détails et l'emprunter rapidement
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Carte de membre</h4>
              <p className="text-sm text-gray-500">
                Scannez votre carte de membre pour accéder rapidement à votre profil
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <ScanLine className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Code-barres ISBN</h4>
              <p className="text-sm text-gray-500">
                Scannez le code-barres ISBN pour rechercher un livre dans notre catalogue
              </p>
            </div>
          </div>
        </div>

    
        <div className="mt-6">
          <button 
            onClick={handleActivateCamera}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
          >
            <ScanLine className="w-5 h-5" />
            Activer la caméra
          </button>
        </div>

        {cameraActive && (
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-700 text-sm text-center">
              Caméra activée ! Pointez vers un QR code.
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}