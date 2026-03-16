// resources/js/Pages/Populaires.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { livres } from '../data/mockData';
import NewBookCard from '@/Components/NewBookCard';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Populaires() {
  // Les mêmes livres que dans Home.jsx pour la section Populaires
  const livresPopulaires = livres.filter(l => l.nb_disponibles > 0).slice(5, 17);
  
  return (
    <MobileLayout>
      {/* En-tête avec bouton retour */}
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Populaires</h1>
      </div>

      {/* Liste des livres */}
      <div className="px-6 py-4 space-y-3">
        {livresPopulaires.map((livre) => (
          <NewBookCard
            key={livre.id}
            livre={livre}
          />
        ))}
      </div>
    </MobileLayout>
  );
}