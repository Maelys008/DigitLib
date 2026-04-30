import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Library as LibraryIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';
import DashboardHeader from '@/Components/liberian/DashboardHeader';
import LibraryInfoCard from '@/Components/liberian/LibraryInfoCard';
import StatisticsGrid from '@/Components/liberian/StatisticsGrid';
import ActionButtons from '@/Components/liberian/ActionButtons';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
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

  // Fonction pour charger les pénalités
  const loadUnpaidPenalties = async (lib) => {
    if (!lib) return;
    
    const isUserAdmin = lib.administrator_id === user?.id;
    if (!isUserAdmin) {
      console.log('Non admin - pas de chargement des pénalités');
      return;
    }
    
    try {
      const data = await api.getUnpaidPenaltiesCount(lib.id);
      const unpaidCount = data.count || 0;
      setStats(prev => ({
        ...prev,
        lateReturns: unpaidCount  
      }));
    } catch (error) {
      console.error('Erreur chargement pénalités:', error);
      setStats(prev => ({
        ...prev,
        lateReturns: 0
      }));
    }
  };

  const loadBooks = async (lib) => {
    if (!lib) return;
    try {
      let allBooks = [];
      let currentPage = 1;
      let hasMore = true;
      let totalCopies = 0;
      let totalAvailable = 0;
      
      while (hasMore) {
        const response = await api.getBooks({ 
          library_id: lib.id,
          page: currentPage,
          per_page: 100
        });
        
        const booksData = response.data?.data || [];
        allBooks = [...allBooks, ...booksData];
        
        booksData.forEach(book => {
          totalCopies += book.nb_copy || 0;
          totalAvailable += book.nb_available || 0;
        });
        
        hasMore = response.data?.current_page < response.data?.last_page;
        currentPage++;
      }
      
      setBooks(allBooks);
      setStats(prev => ({
        ...prev,
        totalCopies: totalCopies,
        totalBooks: allBooks.length,
        available: totalAvailable,
        borrowed: totalCopies - totalAvailable
      }));
      
    } catch (error) {
      console.error('Erreur chargement livres:', error);
    }
  };

  const loadMembers = async (lib) => {
    if (!lib) return;
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
    if (!lib) return;
    try {
      const reservationsData = await api.getLibraryReservations(lib.id);
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

  useEffect(() => {
    const loadLibrary = async () => {
      if (!user) {
        console.log('Pas d\'utilisateur connecté');
        setIsLoading(false);
        return;
      }
      
      console.log('Utilisateur connecté:', user);
      setIsLoading(true);
      
      if (activeLibrary) {
        console.log('🎯 Utilisation de la bibliothèque active:', activeLibrary.name);
        setLibrary(activeLibrary);
        await loadBooks(activeLibrary);
        await loadMembers(activeLibrary);
        await loadReservations(activeLibrary);
        await loadUnpaidPenalties(activeLibrary);
        setIsLoading(false);
        return;
      }
      
      const allLibraries = await api.getUserLibraries();
      const owned = allLibraries.find(lib => lib.administrator_id === user?.id);
      
      if (owned) {
        console.log('📚 Chargement bibliothèque possédée:', owned.name);
        setLibrary(owned);
        await loadBooks(owned);
        await loadMembers(owned);
        await loadReservations(owned);
        await loadUnpaidPenalties(owned);
        setIsLoading(false);
        return;
      }
      
      const internalLibraries = allLibraries.filter(lib => lib.administrator_id !== user?.id);
      if (internalLibraries.length > 0) {
        console.log('📚 Chargement bibliothèque membre interne:', internalLibraries[0].name);
        setLibrary(internalLibraries[0]);
        await loadBooks(internalLibraries[0]);
        await loadMembers(internalLibraries[0]);
        await loadReservations(internalLibraries[0]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
    };
    
    if (!libraryLoading) {
      loadLibrary();
    }
  }, [user, activeLibrary, libraryLoading]);

  const isAdmin = library && library.administrator_id === user?.id;

  const handleManageBooks = () => router.visit('/librarian/books');
  const handleManageInternalMembers = () => router.visit('/librarian/internal-members');
  const handleManageUsers = () => router.visit('/librarian/manage-users');
  const handleManagePenalties = () => router.visit('/librarian/manage-penalties');
  const handleViewIncidents = () => router.visit('/librarian/incidents');
  const handleViewReports = () => router.visit('/librarian/reports');
  const handleBorrowingRules = () => router.visit('/librarian/borrowing-rules');
  const handlePartnerLibraries = () => router.visit('/librarian/partner-libraries');
  const handleViewCasier = () => router.visit('/librarian/library-records');
  const handleManageContestations = () => router.visit('/librarian/contestations');

  if (isLoading || libraryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardHeader />
        <div className="p-6 text-center">
          <LibraryIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Aucune bibliothèque trouvée</p>
          <button 
            onClick={() => router.visit('/librarian/create')} 
            className="mt-4 px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            Créer une bibliothèque
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          onViewCasier={handleViewCasier}
          onManageContestations={handleManageContestations}
        />
      </div>
    </div>
  );
}