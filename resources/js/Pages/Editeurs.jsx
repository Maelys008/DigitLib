// resources/js/Pages/Editeurs.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Editeurs() {
  const maisonsEdition = [
    { id: 1, nom: 'BOMBORA' },
    { id: 2, nom: 'ROSEM' }, 
    { id: 3, nom: 'GALLIMARD' },
    { id: 4, nom: 'ACTES SUD' },
    { id: 5, nom: 'SEUIL' },
    { id: 6, nom: 'FLAMMARION' },
    { id: 7, nom: 'ALBIN MICHEL' },
    { id: 8, nom: 'STOCK' },
    { id: 9, nom: 'GRASSET' },
    { id: 10, nom: 'MINUIT' },
    { id: 11, nom: 'POL' },
    { id: 12, nom: 'DENOËL' }
  ];

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Maisons d'édition</h1>
      </div>

      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {maisonsEdition.map((editeur) => (
            <div key={editeur.id} className="px-4 py-2 bg-gray-100 text-gray-800 rounded">
              {editeur.nom}
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}