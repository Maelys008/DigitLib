import MobileLayout from '@/Layouts/MobileLayout';
import { livres } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import NewBookCard from '@/Components/NewBookCard';
import VerticalScroll from '@/Components/VerticalScroll';

export default function GenreBooks() {
  const { props } = usePage();
  const { genre } = props;
  const livresDuGenre = livres.filter(l => 
    l.genre.toLowerCase() === genre.toLowerCase()
  );

  const handleGoBack = () => {
    router.visit('/genres');
  };

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <button 
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{genre}</h1>
          <p className="text-sm text-gray-500 mt-1">{livresDuGenre.length} livres</p>
        </div>
      </div>
      <div className="px-6 py-4">
        <VerticalScroll>
          {livresDuGenre.map((livre) => (
            <NewBookCard
              key={livre.id}
              livre={livre}
            />
          ))}
        </VerticalScroll>
      </div>
    </MobileLayout>
  );
}