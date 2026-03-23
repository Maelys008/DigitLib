// resources/js/Pages/ReadBooks.jsx

import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Star } from 'lucide-react';
import { router } from '@inertiajs/react';
import { historiqueEmprunts } from '../data/mockData';
import NewBookCard from '@/Components/NewBookCard';

export default function ReadBooks() {
  const [readBooks, setReadBooks] = useState([]);

  useEffect(() => {
    // Récupérer les livres déjà lus depuis l'historique des emprunts
    const livresLus = historiqueEmprunts.map(emprunt => emprunt.livre);
    setReadBooks(livresLus);
  }, []);

  return (
    <MobileLayout>
      <div className="px-6 py-4">
        {/* En-tête avec bouton retour */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.visit('/library')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Livres lus</h1>
          </div>
        </div>

        {/* Nombre de livres lus */}
        <p className="text-sm text-gray-500 mb-4">
          {readBooks.length} livre{readBooks.length > 1 ? 's' : ''} déjà lus
        </p>

        {/* Liste des livres lus */}
        {readBooks.length > 0 ? (
          <div className="space-y-3">
            {readBooks.map((livre) => (
              <NewBookCard
                key={livre.id}
                livre={livre}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Aucun livre lu pour le moment</p>
            <p className="text-xs text-gray-400 mt-2">
              Les livres que vous aurez lus apparaîtront ici
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}