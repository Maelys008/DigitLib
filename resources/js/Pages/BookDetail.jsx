import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Star } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react'; 
import HorizontalScroll from '@/Components/HorizontalScroll';
import BookCard from '@/Components/BookCard';
import { getPastelColor } from '@/Constants/colors';
import BookHeader from '@/Components/BookDetails/BookHeader'; 
import LibraryJoinButton from '@/Components/BookDetails/LibraryJoinButton';
import BorrowButton from '@/Components/BookDetails/BorrowButton';
import ReviewSection from '@/Components/BookDetails/ReviewSection';
import api from '../services/api';

const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 4.0,
  titre: book.title,
  auteur: book.author,
  annee_publication: book.year_of_publication ? new Date(book.year_of_publication).getFullYear() : null,
});

export default function BookDetail() {
  const [isLiked, setIsLiked] = useState(false);
  const [isLibraryJoined, setIsLibraryJoined] = useState(false);
  const [showJoinWarning, setShowJoinWarning] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [livre, setLivre] = useState(null);
  const [livresRecommandes, setLivresRecommandes] = useState([]);
  const [avisDuLivre, setAvisDuLivre] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { props } = usePage();
  const { id } = props;

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        // Récupérer le livre
        const bookResponse = await api.getBook(id);
        const normalizedBook = normalizeBook(bookResponse);
        setLivre(normalizedBook);
        
        // Récupérer tous les livres pour les recommandations
        const booksResponse = await api.getBooks();
        let booksData = [];
        
        if (booksResponse.data?.data) {
          booksData = booksResponse.data.data;
        } else if (Array.isArray(booksResponse)) {
          booksData = booksResponse;
        } else if (booksResponse.data && Array.isArray(booksResponse.data)) {
          booksData = booksResponse.data;
        }
        
        const normalizedBooks = booksData.map(normalizeBook);
        
        // Livres recommandés : même genre, différent ID
        const recommandations = normalizedBooks.filter(l => 
          l.genre === normalizedBook.genre && l.id !== normalizedBook.id
        ).slice(0, 17);
        setLivresRecommandes(recommandations);
        
        // TODO: Récupérer les avis depuis l'API quand elle sera prête
        // Pour l'instant, on garde les avis mockés ou on laisse vide
        setAvisDuLivre([]);
        
      } catch (error) {
        console.error('Erreur chargement livre:', error);
        setError('Impossible de charger le livre');
        
        // Fallback vers mockData
        const { livres: mockLivres, avis: mockAvis } = await import('../data/mockData');
        const mockBook = mockLivres.find(l => l.id === parseInt(id));
        if (mockBook) {
          setLivre(mockBook);
          const mockRecommandations = mockLivres.filter(l => 
            l.genre === mockBook.genre && l.id !== mockBook.id
          ).slice(0, 17);
          setLivresRecommandes(mockRecommandations);
          setAvisDuLivre(mockAvis.filter(a => a.livre_id === parseInt(id)));
        }
        
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);

  const handleLibraryJoin = () => {
    setIsLibraryJoined(true);
    setShowJoinWarning(false);
  };
  
  const handleBorrow = () => {
    console.log('Livre emprunté !');
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (!livre) {
    return (
      <MobileLayout>
        <div className="px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900">Livre non trouvé</h2>
          <p className="text-gray-500 mt-2">ID: {id}</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <BookHeader 
        imageUrl={livre.image_couverture}
        titre={livre.titre}
        onLike={(liked) => setIsLiked(liked)}
        isLiked={isLiked}
      />
				
      {/* SECTION INFOS PRINCIPALES */}
      <div className="px-6 pt-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* Auteur */}
          <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
            <User className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-500">Auteur</span>
            <span className="text-sm font-semibold text-gray-900 text-center line-clamp-1">{livre.auteur}</span>
          </div>
          
          {/* Genre */}
          <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
            <BookOpen className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-500">Genre</span>
            <span className="text-sm font-semibold text-gray-900 text-center line-clamp-1">{livre.genre}</span>
          </div>
          
          {/* Année */}
          <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
            <Calendar className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-xs text-gray-500">Année</span>
            <span className="text-sm font-semibold text-gray-900 text-center">{livre.annee_publication}</span>
          </div>
          
          {/* Note */}
          <div className="bg-gray-100 rounded-xl p-3 flex flex-col items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-1" />
            <span className="text-xs text-gray-500">Note</span>
            <span className="text-sm font-semibold text-gray-900 text-center">{livre.note}</span>
          </div>
        </div>
      
        {/* BOUTON REJOINDRE BIBLIOTHÈQUE */}
        <div className="mb-6 pt-4" id="join-library-button">
          <LibraryJoinButton 
            bibliothequeNom={livre.bibliotheque?.nom || 'Bibliothèque'}
            onJoin={handleLibraryJoin}
            showWarning={showJoinWarning}
            onWarningClose={() => setShowJoinWarning(false)}
          />
        </div>
      
        {/* DESCRIPTION */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">À propos du livre</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {isDescriptionExpanded 
              ? livre.description 
              : `${livre.description?.substring(0, 120) || ''}...`}
          </p>
          {livre.description && livre.description.length > 120 && (
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-gray-900 text-sm font-medium mt-1"
            >
              {isDescriptionExpanded ? 'Réduire' : 'Voir plus'}
            </button>
          )}
        </div>
           
        {/* BOUTON EMPRUNTER */}
        <BorrowButton 
          bibliothequeNom={livre.bibliotheque?.nom || 'Bibliothèque'}
          isLibraryJoined={isLibraryJoined}
          onBorrow={handleBorrow}
          onShowWarning={setShowJoinWarning}
        />

        {/* SECTION AVIS */}
        <ReviewSection 
          reviews={avisDuLivre} 
          bookId={livre.id}
          bookTitle={livre.titre}
        />
        
        {/* LIVRES RECOMMANDÉS */}
        {livresRecommandes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">{livre.genre}</h2>
              <Link 
                href={`/genres/${encodeURIComponent(livre.genre.toLowerCase())}`} 
                className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                Tous
              </Link>
            </div>
            <HorizontalScroll>
              {livresRecommandes.map((livreRec, index) => (
                <BookCard
                  key={livreRec.id}
                  livre={livreRec}
                  variant="horizontal"
                  backgroundColor={getPastelColor(index)}
                />
              ))}
            </HorizontalScroll>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}