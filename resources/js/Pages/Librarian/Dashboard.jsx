import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Library as LibraryIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import DashboardHeader from '@/Components/liberian/DashboardHeader';
import LibraryInfoCard from '@/Components/liberian/LibraryInfoCard';
import StatisticsGrid from '@/Components/liberian/StatisticsGrid';
import ActionButtons from '@/Components/liberian/ActionButtons';

export default function Dashboard() {
  const { user } = useAuth();
  const [library, setLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalCopies: 0,
    totalBooks: 0,
    users: 0,
    available: 0,
    borrowed: 0,
    reservations: 0,
    lateReturns: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedLibrary = localStorage.getItem('user_library');
    if (savedLibrary) {
      const lib = JSON.parse(savedLibrary);
      setLibrary(lib);
      loadBooks(lib);
      loadMembers(lib);  
    }
    setIsLoading(false);
  }, []);

  const loadBooks = async (lib) => {
    try {
      const response = await api.getBooks({ library_id: lib.id });
      const booksData = response.data?.data || [];
      setBooks(booksData);
      
      let totalCopies = 0;
      let totalAvailable = 0;
      
      booksData.forEach(book => {
        totalCopies += book.nb_copy || 0;
        totalAvailable += book.nb_available || 0;
      });
      
      setStats(prev => ({
        ...prev,
        totalCopies: totalCopies,
        totalBooks: booksData.length,
        available: totalAvailable,
        borrowed: totalCopies - totalAvailable
      }));
    } catch (error) {
      console.error('Erreur chargement livres:', error);
    }
  };

  const loadMembers = async (lib) => {
    try {
      const members = await api.getLibraryMembers(lib.id);
      setStats(prev => ({
        ...prev,
        users: members.length 
      }));
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  // Navigation vers la page de gestion des livres
  const handleManageBooks = () => {
    router.visit('/librarian/books');
  };

  const handleManageInternalMembers = () => {
    router.visit('/librarian/internal-members');
  };

  const handleManageUsers = () => console.log('Gérer utilisateurs');
  const handleViewIncidents = () => console.log('Voir incidents');
  const handleViewReports = () => console.log('Rapports');
  const handleBorrowingRules = () => console.log('Règles emprunt');
  const handlePartnerLibraries = () => console.log('Bibliothèques partenaires');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="p-6 text-center">
          <LibraryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune bibliothèque</p>
          <button 
            onClick={() => router.visit('/librarian/create')} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Créer une bibliothèque
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="p-6">
        <LibraryInfoCard library={library} />
        <StatisticsGrid stats={stats} />
        <ActionButtons 
          onManageBooks={handleManageBooks}
          onManageInternalMembers={handleManageInternalMembers}  
          onManageUsers={handleManageUsers}
          onViewIncidents={handleViewIncidents}
          onViewReports={handleViewReports}
          onBorrowingRules={handleBorrowingRules}
          onPartnerLibraries={handlePartnerLibraries}
        />
      </div>
    </div>
  );
}