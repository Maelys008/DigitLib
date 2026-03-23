import MobileLayout from '@/Layouts/MobileLayout';
import { livres } from '../data/mockData';
import NewBookCard from '@/Components/NewBookCard';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function NewReleases() {
  const livresNouveaux = livres.slice(-6);
  
  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nouveautés</h1>
      </div>
      <div className="px-6 py-4 space-y-3">
        {livresNouveaux.map((livre) => (
          <NewBookCard
            key={livre.id}
            livre={livre}
          />
        ))}
      </div>
    </MobileLayout>
  );
}