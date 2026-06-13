import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
  Download, Calendar, TrendingUp, Users, BookOpen, 
  BarChart3, FileText, PieChart, Loader2, ChevronLeft,
  AlertCircle, CheckCircle, ArrowLeft
} from 'lucide-react';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext';
import api from '../../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Reports() {
  const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary();
  const libraryId = activeLibrary?.id;

  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState(null);
  const [topBooks, setTopBooks] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [genreDistribution, setGenreDistribution] = useState([]);
  const [activePenalties, setActivePenalties] = useState([]);
  const reportContentRef = useRef(null);

  useEffect(() => {
    if (!libraryLoading && libraryId) {
      console.log('📊 Chargement des rapports pour:', activeLibrary?.name);
      fetchAllData();
    } else if (!libraryLoading && !libraryId) {
      console.log('❌ Pas de bibliothèque active');
      setIsLoading(false);
    }
  }, [libraryId, dateRange, libraryLoading]);

  const fetchAllData = async () => {
    if (!libraryId) return;
    
    setIsLoading(true);
    
    try {
      const [statsData, topBooksData, topUsersData, genreData, penaltiesData] = await Promise.all([
        api.getReportsStats(libraryId, dateRange),
        api.getTopBooks(libraryId, 5),
        api.getTopUsers(libraryId, 5),
        api.getGenreDistribution(libraryId),
        api.getActivePenalties(libraryId)
      ]);
      
      setStats(statsData);
      setTopBooks(topBooksData || []);
      setTopUsers(topUsersData || []);
      setGenreDistribution(genreData || []);
      setActivePenalties(penaltiesData || []);
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
      setStats({
        totalBooks: 0,
        totalCopies: 0,
        disponible: 0,
        emprunté: 0,
        users: 0,
        reservations: 0,
        lateReturns: 0,
        totalPenalties: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!reportContentRef.current) return;
    
    setIsExporting(true);
    
    try {
      const element = reportContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `DigiLib - Rapport ${getReportTitle()} - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          10, 285
        );
      }
      
      pdf.save(`rapport_${selectedReport}_${dateRange}_${new Date().toISOString().slice(0, 19)}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (libraryLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!libraryId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md p-6 shadow-2xl">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Aucune bibliothèque trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Vous devez être associé à une bibliothèque pour accéder aux rapports.
              </p>
              <button
                onClick={() => router.visit('/librarian/dashboard')}
                className="mt-6 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Retour au tableau de bord
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const reportTypes = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3, color: 'orange' },
    { id: 'borrowings', label: 'Emprunts', icon: BookOpen, color: 'blue' },
    { id: 'users', label: 'Utilisateurs', icon: Users, color: 'purple' },
    { id: 'inventory', label: 'Inventaire', icon: PieChart, color: 'green' },
    { id: 'penalties', label: 'Pénalités', icon: FileText, color: 'red' },
  ];

  const getReportTitle = () => {
    const report = reportTypes.find(r => r.id === selectedReport);
    return report ? report.label : 'Rapport';
  };

  const getDateRangeText = () => {
    switch(dateRange) {
      case 'week': return 'cette semaine';
      case 'month': return 'ce mois';
      case 'year': return 'cette année';
      default: return '';
    }
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 dark:text-orange-400 animate-spin" />
        </div>
      );
    }

    const displayStats = stats || {
      totalBooks: 0,
      totalCopies: 0,
      disponible: 0,
      emprunté: 0,
      users: 0,
      reservations: 0,
      lateReturns: 0,
      totalPenalties: 0
    };

    switch (selectedReport) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 p-6 rounded-xl">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-4 text-lg">
                Statistiques générales
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total livres</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.totalBooks || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total exemplaires</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.totalCopies || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.users || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Emprunts en cours</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{displayStats.emprunté || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Réservations</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{displayStats.reservations || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Retards</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{displayStats.lateReturns || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-6 rounded-xl">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-lg">
                Taux d'utilisation
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Livres empruntés</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-300">
                      {displayStats.totalBooks ? Math.round((displayStats.emprunté / displayStats.totalBooks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${displayStats.totalBooks ? (displayStats.emprunté / displayStats.totalBooks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Livres disponibles</span>
                    <span className="font-semibold text-green-900 dark:text-green-300">
                      {displayStats.totalBooks ? Math.round((displayStats.disponible / displayStats.totalBooks) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${displayStats.totalBooks ? (displayStats.disponible / displayStats.totalBooks) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {displayStats.lateReturns > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 p-6 rounded-xl">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Alertes importantes
                </h4>
                <p className="text-red-700 dark:text-red-300">
                  {displayStats.lateReturns} retour{displayStats.lateReturns > 1 ? 's' : ''} en retard nécessite{displayStats.lateReturns > 1 ? 'nt' : ''} votre attention
                </p>
              </div>
            )}
          </div>
        );

      case 'borrowings':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-6 rounded-xl">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-lg">
                Rapport des emprunts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Emprunts actifs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.emprunté || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500 dark:text-green-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Réservations en attente</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.reservations || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  Livres les plus empruntés
                </p>
                <div className="space-y-3">
                  {topBooks.length > 0 ? (
                    topBooks.map((book, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{book.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                        </div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          {book.total} fois
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucune donnée disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 p-6 rounded-xl">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 text-lg">
                Rapport utilisateurs
              </h4>
              <div className="mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{displayStats.users || 0}</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  Utilisateurs les plus actifs
                </p>
                <div className="space-y-3">
                  {topUsers.length > 0 ? (
                    topUsers.map((user, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                        <span className="font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                          {user.total} emprunts
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucune donnée disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 p-6 rounded-xl">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-4 text-lg">
                Rapport d'inventaire
              </h4>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  État des livres
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">Disponibles</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                      {displayStats.disponible || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-gray-700 dark:text-gray-300">Empruntés</span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                      {displayStats.emprunté || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="text-gray-700 dark:text-gray-300">Réservés</span>
                    </div>
                    <span className="font-semibold text-orange-600 dark:text-orange-400 text-lg">
                      {displayStats.reservations || 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  Répartition par genre
                </p>
                <div className="space-y-3">
                  {genreDistribution.length > 0 ? (
                    genreDistribution.map((genre, index) => (
                      <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span className="text-gray-700 dark:text-gray-300">{genre.name}</span>
                        <span className="font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          {genre.total} livres
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Aucune donnée disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'penalties':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10 p-6 rounded-xl">
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-4 text-lg">
                Rapport des pénalités
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Retours en retard</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{displayStats.lateReturns || 0}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total pénalités</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">{displayStats.totalPenalties || 0} FCFA</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-semibold">
                  Pénalités actives
                </p>
                <div className="space-y-3">
                  {activePenalties.length > 0 ? (
                    activePenalties.map((penalty, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{penalty.user_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{penalty.book_title}</p>
                          </div>
                          <span className="font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                            {penalty.amount} FCFA
                          </span>
                        </div>
                        {penalty.days_late && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Retard: {penalty.days_late} jour(s)
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Aucune pénalité active
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Bouton de retour uniquement - pas de DashboardHeader */}
        <div className="mb-6">
          <button
            onClick={() => router.visit('/librarian/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au tableau de bord
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Rapports de bibliothèque
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeLibrary?.name} - Période: {getDateRangeText()}
                </p>
              </div>
              
              <button
                onClick={exportToPDF}
                disabled={isExporting || isLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Génération du PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Exporter en PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDateRange('week')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                dateRange === 'week'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                dateRange === 'month'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Ce mois
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                dateRange === 'year'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Cette année
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 overflow-x-auto">
          <div className="flex flex-wrap gap-2">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`px-5 py-2.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                    selectedReport === report.id
                      ? `bg-${report.color}-500 text-white shadow-md`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {report.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div ref={reportContentRef}>
            {renderReportContent()}
          </div>
        </div>
      </div>
    </div>
  );
}