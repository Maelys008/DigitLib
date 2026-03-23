import MobileLayout from '@/Layouts/MobileLayout';
import { useState } from 'react';
import { Search, X, ChevronLeft } from 'lucide-react'; 
import { router } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard'; 
import { livres } from '../data/mockData';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setHasSearched(true);

    const livresTrouves = livres.filter(livre => 
      livre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      livre.auteur.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let combinedResults = [];
    if (activeFilter === 'all') {
      combinedResults = livresTrouves;
    } else if (activeFilter === 'books') {
      combinedResults = livresTrouves;
    } else if (activeFilter === 'authors') {
      // Pour les auteurs, on retourne tous les livres de l'auteur trouvé
      const auteursTrouves = [...new Set(livresTrouves.map(l => l.auteur))];
      combinedResults = livres.filter(livre => 
        auteursTrouves.includes(livre.auteur)
      );
    }

    setResults(combinedResults);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (hasSearched && searchTerm.trim()) {
      handleSearch(new Event('submit'));
    }
  };

  const handleCancel = () => {
    setSearchTerm('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <MobileLayout>
      <div className="px-4 py-3 bg-white">
        <div className="flex items-center gap-3">
          {hasSearched && (
            <button onClick={() => {
              setHasSearched(false);
              setResults([]);
              setSearchTerm('');
            }} className="text-gray-600">
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <form onSubmit={handleSearch} className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un livre ou un auteur"
              className="w-full pl-10 pr-10 py-2 bg-[#F2F2F7] border-none rounded-xl text-[17px] focus:ring-0 placeholder-gray-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-400 rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </button>
            )}
          </form>
          
          {!hasSearched && (
            <button 
              onClick={handleCancel}
              className="text-[#111827] text-[17px] font-normal whitespace-nowrap"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => handleFilterChange('books')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'books' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Livres
          </button>
          <button
            onClick={() => handleFilterChange('authors')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'authors' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Auteurs
          </button>
        </div>
      </div>

    
      <div className="px-4 py-2">
        {hasSearched && (
          <p className="text-sm text-gray-500 mb-4">
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </p>
        )}

        {hasSearched && results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun résultat trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((livre) => (
              <NewBookCard
                key={livre.id}
                livre={livre}
              />
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}