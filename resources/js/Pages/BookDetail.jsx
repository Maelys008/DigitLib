import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Star, AlertCircle } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react'; 
import HorizontalScroll from '@/Components/HorizontalScroll';
import BookCard from '@/Components/BookCard';
import { getPastelColor } from '@/Constants/colors';
import BookHeader from '@/Components/BookDetails/BookHeader'; 
import BorrowButton from '@/Components/BookDetails/BorrowButton';
import ReviewSection from '@/Components/BookDetails/ReviewSection';
import LibraryJoinButton from '@/Components/BookDetails/LibraryJoinButton';
import { useAuth } from '@/contexts/AuthContext';
import api from '../services/api';

export default function BookDetail() {
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [livre, setLivre] = useState(null);
  const [livresRecommandes, setLivresRecommandes] = useState([]);
  const [avisDuLivre, setAvisDuLivre] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showJoinWarning, setShowJoinWarning] = useState(false);
  const [hasJoinedLibrary, setHasJoinedLibrary] = useState(false);
  const [isCheckingLibrary, setIsCheckingLibrary] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [reservationSuccessMessage, setReservationSuccessMessage] = useState(null);

  const { props } = usePage();
  const { id } = props;

  // Fonction normalizeBook à l'intérieur du composant
  const normalizeBook = (book) => ({
    ...book,
    image_couverture: book.cover_url || book.cover_image,
    nb_disponibles: book.nb_available,
    note: book.note || 4.0,
    titre: book.title,
    auteur: book.author,
    annee_publication: book.year_of_publication ? new Date(book.year_of_publication).getFullYear() : null,
    genreName: typeof book.genre === 'string' ? book.genre : book.genre?.name || 'Inconnu',
    genre_id: book.genre?.id || book.genre_id,
  });

  const clearJoinWarning = () => setShowJoinWarning(false);
  const clearSuccessMessage = () => setSuccessMessage(null);
  const clearReservationSuccessMessage = () => setReservationSuccessMessage(null);

  const handleReservationCreated = (reservation) => {
    console.log('Réservation créée avec succès:', reservation);
    setReservationSuccessMessage('Vous êtes en liste d\'attente. Vous serez notifié dès qu\'un exemplaire sera disponible.');
    setTimeout(() => setReservationSuccessMessage(null), 5000);
  };

  const handleReviewCreated = (newReview) => {
    setAvisDuLivre(prev => [newReview, ...prev]);
    
    const allReviews = [newReview, ...avisDuLivre];
    const totalNotes = allReviews.reduce((sum, r) => sum + r.note, 0);
    const newAverage = (totalNotes / allReviews.length).toFixed(1);
    
    setLivre(prev => ({ ...prev, note: parseFloat(newAverage) }));
  };

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const bookResponse = await api.getBook(id);
        
        if (!bookResponse) {
          throw new Error('Livre non trouvé');
        }
        
        const normalizedBook = normalizeBook(bookResponse);
        setLivre(normalizedBook);
        
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
        
        // Recommandations - prend tous les livres du même genre
        const recommandations = normalizedBooks.filter(l => {
          const currentGenre = (normalizedBook.genreName || '').toLowerCase().trim();
          const otherGenre = (l.genreName || '').toLowerCase().trim();
          return currentGenre === otherGenre && l.id !== normalizedBook.id;
        });
        
        console.log('=== RECOMMANDATIONS ===');
        console.log('Livre:', normalizedBook.titre);
        console.log('Genre:', normalizedBook.genreName);
        console.log('Total livres du même genre:', recommandations.length);
        
        setLivresRecommandes(recommandations);
        setAvisDuLivre([]);
        
       if (isAuthenticated && normalizedBook.library?.id) {
  try {
    const library = await api.getLibrary(normalizedBook.library.id);
    const joined = library.is_member === true;
    setHasJoinedLibrary(joined);
    console.log('📚 Adhésion:', { 
      libraryId: normalizedBook.library.id, 
      is_member: library.is_member,
      joined 
    });
  } catch (err) {
    console.error('Erreur vérification bibliothèque:', err);
    setHasJoinedLibrary(false);
  }
} else {
  setHasJoinedLibrary(false);
}
        
      } catch (error) {
        console.error('Erreur chargement livre:', error);
        setError('Impossible de charger le livre');
        
        try {
          const { livres: mockLivres, avis: mockAvis } = await import('../data/mockData');
          const mockBook = mockLivres.find(l => l.id === parseInt(id));
          if (mockBook) {
            setLivre(mockBook);
            const mockRecommandations = mockLivres.filter(l => 
              l.genre === mockBook.genre && l.id !== mockBook.id
            );
            setLivresRecommandes(mockRecommandations);
            setAvisDuLivre(mockAvis.filter(a => a.livre_id === parseInt(id)));
          }
        } catch (mockError) {
          console.error('Erreur chargement mock data:', mockError);
        }
      } finally {
        setIsCheckingLibrary(false);
        setIsLoading(false);
      }
    };
    
    fetchBook();
  }, [id, isAuthenticated]);

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  if (error && !livre) {
    return (
      <MobileLayout>
        <div className="px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Erreur</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
        </div>
      </MobileLayout>
    );
  }

  if (!livre) {
    return (
      <MobileLayout>
        <div className="px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Livre non trouvé</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">ID: {id}</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <BookHeader 
        imageUrl={livre.image_couverture}
        titre={livre.titre}
        auteur={livre.auteur}
        bookId={livre.id} 
        onLike={(liked) => setIsLiked(liked)}
        isLiked={isLiked}
      />
        
      {/* SECTION INFOS PRINCIPALES */}
      <div className="px-6 pt-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex flex-col items-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Auteur</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-1">{livre.auteur}</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex flex-col items-center">
            <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Genre</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{livre.genreName}</p>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex flex-col items-center">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Année</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">{livre.annee_publication}</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex flex-col items-center">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-1" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Note</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white text-center">{livre.note}</span>
          </div>
        </div>
        
        {/* MESSAGE D'AVERTISSEMENT */}
        {showJoinWarning && (
          <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  Vous devez rejoindre la bibliothèque
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                  "{livre.library?.name || livre.bibliotheque?.nom || 'Bibliothèque'}" avant d'emprunter un livre
                </p>
              </div>
              <button 
                onClick={clearJoinWarning}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg">
            <p className="text-sm">{successMessage}</p>
            <button 
              onClick={clearSuccessMessage}
              className="text-xs text-green-800 dark:text-green-400 underline mt-1"
            >
              Fermer
            </button>
          </div>
        )}
        
        {reservationSuccessMessage && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg">
            <p className="text-sm">{reservationSuccessMessage}</p>
            <button 
              onClick={clearReservationSuccessMessage}
              className="text-xs text-blue-800 dark:text-blue-400 underline mt-1"
            >
              Fermer
            </button>
          </div>
        )}
        
        {/* BOUTON REJOINDRE LA BIBLIOTHÈQUE */}
        {!hasJoinedLibrary && !isCheckingLibrary && (
          <div className="mb-6 pt-4" id="join-library-button">
            <LibraryJoinButton 
              bibliothequeNom={livre.library?.name || livre.bibliotheque?.nom || 'Bibliothèque'}
              libraryId={livre.library?.id || livre.bibliotheque?.id}
              onJoin={() => {
                setHasJoinedLibrary(true);
                setShowJoinWarning(false); 
                setSuccessMessage('Vous avez rejoint la bibliothèque avec succès !');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
      
        {/* DESCRIPTION */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">À propos du livre</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {isDescriptionExpanded 
              ? livre.description 
              : `${livre.description?.substring(0, 120) || ''}...`}
          </p>
          {livre.description && livre.description.length > 120 && (
            <button 
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="text-gray-900 dark:text-gray-300 text-sm font-medium mt-1"
            >
              {isDescriptionExpanded ? 'Réduire' : 'Voir plus'}
            </button>
          )}
        </div>
           
        {/* BOUTON EMPRUNTER */}
       <BorrowButton 
  bookId={livre.id}
  bibliothequeNom={livre.library?.name || livre.bibliotheque?.nom || 'Bibliothèque'}
  bibliothequeAdresse={livre.library?.adress || livre.bibliotheque?.adress || null}
  isLibraryJoined={hasJoinedLibrary}
  isAuthenticated={isAuthenticated}
  onShowWarning={setShowJoinWarning}
  onReservationCreated={handleReservationCreated}
  isBookAvailable={livre.nb_disponibles > 0}
/>

        {/* SECTION AVIS */}
        <ReviewSection 
          reviews={avisDuLivre} 
          bookId={livre.id}
          bookTitle={livre.titre}
          onReviewAdded={handleReviewCreated}
        />
        
        {/* LIVRES RECOMMANDÉS */}
        {livresRecommandes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{livre.genreName}</h2>
              <Link 
                href={`/genres/${encodeURIComponent(livre.genreName.toLowerCase())}`} 
                className="text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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