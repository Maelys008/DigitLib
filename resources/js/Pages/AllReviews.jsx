import MobileLayout from '@/Layouts/MobileLayout';
import { ArrowLeft } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import ReviewCard from '@/Components/BookDetails/ReviewCard';
import { avis } from '../data/mockData'; 

export default function AllReviews() {
  const { props } = usePage();
  const { bookId, bookTitle } = props;
  const avisDuLivre = avis.filter(a => a.livre_id === bookId);

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <Link href={`/book/${bookId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tous les avis</h1>
          <p className="text-sm text-gray-500 mt-1">{avisDuLivre.length} avis</p>
        </div>
      </div>

      <div className="px-6 py-4 divide-y divide-gray-100">
        {avisDuLivre.map((review) => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            variant="list"
          />
        ))}
      </div>
    </MobileLayout>
  );
}