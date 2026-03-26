import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import { notifications } from '../data/mockData';
import TopBar from '@/Components/TopBar';
import SectionHeader from '@/Components/SectionHeader';
import BookCard from '@/Components/BookCard';
import HorizontalScroll from '@/Components/HorizontalScroll';
import { genreIcons } from '@/Constants/genreIcons';
import GenreCard from '@/Components/GenreCard';
import NewBookCard from '@/Components/NewBookCard';
import { getBookCountByGenre } from '../utils/getBookCountByGenre';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 4.0,
  titre: book.title,
  auteur: book.author,
});

// Fonction pour récupérer TOUS les livres 
const fetchAllBooks = async () => {
  let allBooks = [];
  let currentPage = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await api.getBooks({ page: currentPage });
      let booksData = [];
      
      if (response.data?.data) {
        booksData = response.data.data;
        // Vérifier s'il y a une page suivante
        hasMore = response.data.current_page < response.data.last_page;
      } else if (Array.isArray(response)) {
        booksData = response;
        hasMore = false;
      } else {
        booksData = [];
        hasMore = false;
      }
      
      allBooks = [...allBooks, ...booksData];
      currentPage++;
      
    } catch (error) {
      console.error('Erreur page', currentPage, ':', error);
      hasMore = false;
    }
  }
  
  return allBooks;
};

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  
  const [allBooks, setAllBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [genresList, setGenresList] = useState([]);

  const [livresMembres, setLivresMembres] = useState([]);
  const [livresPopulaires, setLivresPopulaires] = useState([]);
  const [livresNouveaux, setLivresNouveaux] = useState([]);
  const [livresRomans, setLivresRomans] = useState([]);

  const notificationsNonLues = notifications.filter(n => n.statut === 'non_lu');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingBooks(true);
      
      try {
        const allBooksData = await fetchAllBooks();
        const normalizedAllBooks = allBooksData.map(normalizeBook);
        setAllBooks(normalizedAllBooks);
        
        const uniqueGenres = [...new Set(normalizedAllBooks.map(book => book.genre).filter(Boolean))];
        setGenresList(uniqueGenres.slice(0, 6));
        
        // Pour l'affichage, on prend les 17 premiers
        const availableBooks = normalizedAllBooks.filter(l => l.nb_disponibles > 0);
        const sortedByDate = [...normalizedAllBooks].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        setLivresMembres(availableBooks.slice(0, 12));
        setLivresPopulaires(availableBooks.slice(5, 17));
        setLivresNouveaux(sortedByDate.slice(0, 3));
        setLivresRomans(normalizedAllBooks.filter(l => l.genre === 'Roman').slice(0, 17));
        
      } catch (error) {
        console.error('Erreur chargement livres:', error);
        
        // Fallback vers mockData
        const { livres, genres: mockGenres } = await import('../data/mockData');
        const mockBooks = livres;
        setAllBooks(mockBooks);
        setGenresList(mockGenres.slice(0, 6));
        
        const availableMock = mockBooks.filter(l => l.nb_disponibles > 0);
        setLivresMembres(availableMock.slice(0, 17));
        setLivresPopulaires(availableMock.slice(0, 17));
        setLivresNouveaux(mockBooks.slice(-3));
        setLivresRomans(mockBooks.filter(l => l.genre === 'Roman').slice(0, 17));
      } finally {
        setIsLoadingBooks(false);
      }
    };
    
    fetchData();
  }, []);

  if (authLoading || isLoadingBooks) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <TopBar 
        userName={user?.name?.split(' ')[0] || 'Invité'} 
        notificationsNonLues={notificationsNonLues.length}
      />

      {/* SECTION 1: Meilleurs du mois */}
      <div className="px-6 mt-2">
        <SectionHeader titre="Meilleurs du mois" voirToutLien="best-of-month" />
        <HorizontalScroll>
          {livresMembres.slice(0, 12).map((livre, index) => (
            <BookCard
              key={livre.id}
              livre={livre}
              variant="horizontal"
            />
          ))}
        </HorizontalScroll>
      </div>

      {/* SECTION 2: Genres */}
      <div className="px-6 mt-6">
        <SectionHeader titre="Genres" voirToutLien="/genres" />
        <div className="grid grid-cols-2 gap-3"> 
          {genresList.map((genre, index) => {
            const IconComponent = genreIcons[genre];
            return (
              <GenreCard
                key={index}
                genre={genre}
                icon={IconComponent}
                bookCount={getBookCountByGenre(genre, allBooks)}
              />
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Nouveautés */}
      <div className="px-6 mt-6">
        <SectionHeader titre="Nouveautés" voirToutLien="/nouveautes" />
        <div className="space-y-3">
          {livresNouveaux.map((livre) => (
            <NewBookCard
              key={livre.id}
              livre={livre}
            />
          ))}
        </div>
      </div>

      {/* SECTION 5: Populaires */}
      <div className="px-6 mt-6">
        <SectionHeader titre="Populaires" voirToutLien="/populaires" />
        <HorizontalScroll>
          {livresPopulaires.slice(0, 12).map((livre, index) => (
            <BookCard
              key={livre.id}
              livre={livre}
              variant="horizontal"
            />
          ))}
        </HorizontalScroll>
      </div>

      {/* SECTION 6: Romans */}
      <div className="px-6 mt-6 mb-20">
        <SectionHeader titre="Romans" voirToutLien="/romans" />
        <HorizontalScroll>
          {livresRomans.length > 0 ? (
            livresRomans.map((livre, index) => (
              <BookCard
                key={livre.id}
                livre={livre}
                variant="horizontal"
              />
            ))
          ) : (
            livresPopulaires.slice(0, 6).map((livre, index) => (
              <BookCard
                key={livre.id}
                livre={livre}
                variant="horizontal"
              />
            ))
          )}
        </HorizontalScroll>
      </div>
    </MobileLayout>
  );
}