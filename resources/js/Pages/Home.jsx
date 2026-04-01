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

      // Récupérer les 6 premiers genres depuis la table genre
      const genresResponse = await api.getGenres(); 
      const first6Genres = genresResponse.data?.slice(0, 6) || [];
      setGenresList(first6Genres);

      const allBooksList = normalizedAllBooks;
      
      // Trier par date pour les nouveautés
      const sortedByDate = [...normalizedAllBooks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Afficher les 12 premiers livres pour "Meilleurs du mois"
      setLivresMembres(allBooksList.slice(0, 12));
      
      // Afficher les livres 5-17 pour "Populaires" (ou tous si pas assez)
      setLivresPopulaires(allBooksList.slice(5, 17).length > 0 ? allBooksList.slice(5, 17) : allBooksList.slice(0, 12));
      
      // Nouveautés : les 3 plus récents
      setLivresNouveaux(sortedByDate.slice(0, 3));
      
      // Romans : tous les livres du genre Roman (même si disponibles = 0)
      setLivresRomans(normalizedAllBooks.filter(l => l.genre?.name === 'Roman').slice(0, 17));

    } catch (error) {
      console.error('Erreur chargement livres ou genres:', error);

      // Fallback vers mockData
      const { livres, genres: mockGenres } = await import('../data/mockData');
      setAllBooks(livres);
      setGenresList(mockGenres.slice(0, 6));

      // Même logique pour les mocks
      setLivresMembres(livres.slice(0, 17));
      setLivresPopulaires(livres.slice(0, 17));
      setLivresNouveaux(livres.slice(-3));
      setLivresRomans(livres.filter(l => l.genre === 'Roman').slice(0, 17));
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
      <TopBar/>

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
              const IconComponent = genreIcons[genre.name]; 
              return (
                <GenreCard
                  key={index}
                  genre={genre.name}
                  icon={IconComponent}
                  bookCount={getBookCountByGenre(genre.name, allBooks)}
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