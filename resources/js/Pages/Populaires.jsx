import MobileLayout from '@/Layouts/MobileLayout';
import { useState, useEffect } from 'react';
import NewBookCard from '@/Components/NewBookCard';
import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../services/api';
import Pagination from '@/Components/Pagination';


const normalizeBook = (book) => ({
  ...book,
  image_couverture: book.cover_url || book.cover_image,
  nb_disponibles: book.nb_available,
  note: book.note || 4.0,
  titre: book.title,
  auteur: book.author,
});

export default function Populaires() {
  const [livres, setLivres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const perPage = 10;

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      try {
   
        const response = await api.getBooks({ 
          per_page: perPage,
          page: currentPage 
        });
        
        let booksData = [];
        let paginationData = {};
        
        if (response.data?.data) {
          booksData = response.data.data;
          paginationData = {
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total
          };
        } else if (Array.isArray(response)) {
          booksData = response;
          paginationData = { current_page: 1, last_page: 1, total: booksData.length };
        } else if (response.data && Array.isArray(response.data)) {
          booksData = response.data;
          paginationData = { current_page: 1, last_page: 1, total: booksData.length };
        } else {
          booksData = [];
          paginationData = { current_page: 1, last_page: 1, total: 0 };
        }
        
        
        const normalizedBooks = booksData.map(normalizeBook);
        
        const availableBooks = normalizedBooks.filter(l => l.nb_disponibles > 0);
        
        setLivres(availableBooks);
        setTotalPages(paginationData.last_page || 1);
        setTotalBooks(paginationData.total || availableBooks.length);
        
      } catch (error) {
        console.error('Erreur chargement livres:', error);
        setError('Impossible de charger les livres');
        
        // Fallback vers mockData
        const { livres: mockLivres } = await import('../data/mockData');
        const availableMock = mockLivres.filter(l => l.nb_disponibles > 0);
        setLivres(availableMock);
        setTotalPages(1);
        setTotalBooks(availableMock.length);
        
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <MobileLayout>
      <div className="px-6 py-4 flex items-center gap-4 border-b border-gray-100">
        <button 
          onClick={() => router.visit('/')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Populaires</h1>
          <p className="text-sm text-gray-500 mt-1">{totalBooks} livres</p>
        </div>
      </div>
      
      <div className="px-6 py-4 space-y-3">
        {livres.map((livre) => (
          <NewBookCard
            key={livre.id}
            livre={livre}
          />
        ))}
      </div>
      
      {/* Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </MobileLayout>
  );
}