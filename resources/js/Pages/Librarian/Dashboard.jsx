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
    membersCount: 0,  
    available: 0,
    borrowed: 0,
    reservations: 0,
    lateReturns: 0  
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      if (!user) {
        console.log('Pas d\'utilisateur connecté');
        setIsLoading(false);
        return;
      }
      
      console.log('Utilisateur connecté:', user);
      
      setIsLoading(true);
      
      const key = `user_library_${user.id}`;
      let savedLibrary = localStorage.getItem(key);
      
      if (savedLibrary) {
        console.log('Bibliothèque trouvée dans localStorage');
        const lib = JSON.parse(savedLibrary);
        setLibrary(lib);
        await loadBooks(lib);
        await loadMembers(lib);
        await loadReservations(lib);
        await loadUnpaidPenalties(lib); // NOUVEAU
        setIsLoading(false);
        return;
      }
      
      try {
        const libraries = await api.getUserLibraries();
        const userLibrary = libraries.find(lib => lib.administrator_id === user.id);
        
        if (userLibrary) {
          localStorage.setItem(key, JSON.stringify(userLibrary));
          setLibrary(userLibrary);
          await loadBooks(userLibrary);
          await loadMembers(userLibrary);
          await loadReservations(userLibrary);
          await loadUnpaidPenalties(userLibrary); 
        } else {
          console.log('Aucune bibliothèque trouvée pour cet utilisateur');
        }
      } catch (error) {
        console.error('Erreur chargement bibliothèque:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLibrary();
  }, [user]);

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
      const members = await api.getLibraryInscriptions(lib.id);
      setStats(prev => ({
        ...prev,
        membersCount: members.length
      }));
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const loadReservations = async (lib) => {
    try {
      const reservationsData = await api.getLibraryReservations(lib.id);
      console.log('Réservations récupérées:', reservationsData);
      
      const reservationsCount = reservationsData.count || 0;
      
      setStats(prev => ({
        ...prev,
        reservations: reservationsCount
      }));
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
      setStats(prev => ({
        ...prev,
        reservations: 0
      }));
    }
  };

  // NOUVELLE FONCTION : Charger le nombre de pénalités non payées
  const loadUnpaidPenalties = async (lib) => {
    try {
      const data = await api.getUnpaidPenaltiesCount(lib.id);
      console.log('Pénalités non payées:', data);
      
      const unpaidCount = data.count || 0;
      
      setStats(prev => ({
        ...prev,
        lateReturns: unpaidCount  
      }));
    } catch (error) {
      console.error('Erreur chargement pénalités non payées:', error);
      setStats(prev => ({
        ...prev,
        lateReturns: 0
      }));
    }
  };

  const handleManageBooks = () => {
    router.visit('/librarian/books');
  };

  const handleManageInternalMembers = () => {
    router.visit('/librarian/internal-members');
  };
  
  const handleManageUsers = () => {
    router.visit('/librarian/manage-users');
  };
  
  const handleManagePenalties = () => {
    router.visit('/librarian/manage-penalties');
  };
  
  const handleViewIncidents = () => console.log('Voir incidents');
  const handleViewReports = () => console.log('Rapports');
  
  const handleBorrowingRules = () => {
    router.visit('/librarian/borrowing-rules');
  };
  
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
          <p className="text-gray-500">Aucune bibliothèque trouvée</p>
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
          onManagePenalties={handleManagePenalties} 
          onViewIncidents={handleViewIncidents}
          onViewReports={handleViewReports}
          onBorrowingRules={handleBorrowingRules}
          onPartnerLibraries={handlePartnerLibraries}
        />
      </div>
    </div>
  );
}