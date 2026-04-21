import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Mail, User, Shield } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveLibrary } from '@/contexts/ActiveLibraryContext'; 
import api from '../../services/api';

export default function InternalMembers() {
  const { user } = useAuth();
  const { activeLibrary, isLoading: libraryLoading } = useActiveLibrary(); 
  const [library, setLibrary] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', role_id: 2 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { id: 1, name: 'Administrateur', description: 'Gestion complète' },
    { id: 2, name: 'Bibliothécaire', description: 'Gestion des livres et emprunts' },
    { id: 3, name: 'Assistant', description: 'Gestion limitée' },
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) return;
      
      // 🔥 Utilise la bibliothèque active du Context
      if (activeLibrary) {
        console.log('📚 InternalMembers - Utilisation de la bibliothèque active:', activeLibrary.name);
        setLibrary(activeLibrary);
        await loadMembers(activeLibrary.id);
      } else {
        // Fallback: charge la bibliothèque possédée
        const libraries = await api.getUserLibraries();
        const ownedLib = libraries.find(lib => lib.administrator_id === user.id);
        if (ownedLib) {
          setLibrary(ownedLib);
          await loadMembers(ownedLib.id);
        }
      }
      setIsLoading(false);
    };
    
    if (!libraryLoading) {
      loadInitialData();
    }
  }, [user, activeLibrary, libraryLoading]);

  const loadMembers = async (libraryId) => {
    try {
      const response = await api.getInternalMembers(libraryId);
      setMembers(response);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await api.addInternalMember({
      email: formData.email,
      library_id: library.id,     
      role_id: formData.role_id   
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowAddModal(false);
      setFormData({ email: '', role_id: 2 });
      loadMembers(library.id);
    } else {
      setError(result.message);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (confirm('Voulez-vous vraiment retirer ce membre ?')) {
      const result = await api.removeInternalMember(memberId);
      if (result.success) {
        loadMembers(library.id);
      } else {
        alert(result.message);
      }
    }
  };

  // Vérifie si l'utilisateur est admin de cette bibliothèque
  const isAdmin = library && library.administrator_id === user?.id;

  // Redirige si l'utilisateur n'est pas admin
  if (!isLoading && !libraryLoading && !isAdmin && library) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <button onClick={() => router.visit('/librarian/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Membres internes</h1>
        </div>
        <div className="p-6 text-center">
          <Shield className="w-16 h-16 text-red-300 dark:text-red-600 mx-auto mb-3" />
          <p className="text-gray-700 dark:text-gray-300 font-medium">Accès non autorisé</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Seuls les administrateurs peuvent accéder à cette page.
          </p>
          <button
            onClick={() => router.visit('/librarian/dashboard')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <button onClick={() => router.visit('/librarian/dashboard')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Membres internes</h1>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucune bibliothèque trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.visit('/librarian/dashboard')} 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membres internes</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{library.name}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter un membre
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Liste des membres */}
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{member.user?.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.user?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {member.role_assignments?.[0]?.role?.name_role || 'Rôle non défini'}
                      </span>
                    </div>
                  </div>
                </div>
                {member.user_id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">Aucun membre interne</p>
            <button onClick={() => setShowAddModal(true)} className="mt-3 text-purple-600 dark:text-purple-400 text-sm">
              Ajouter votre premier membre
            </button>
          </div>
        )}
      </div>

      {/* Modal d'ajout de membre */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50" onClick={() => setShowAddModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ajouter un membre</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email de l'utilisateur *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="exemple@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">L'utilisateur doit déjà avoir un compte DigiLib</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle *</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-600 text-gray-900 dark:text-white"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 dark:bg-purple-500 text-white font-semibold py-4 rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter le membre'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}