import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { useState, useEffect } from 'react';
import { 
    Search, Users, ShieldCheck, UserX, UserPlus, 
    Loader2, ChevronLeft, ChevronRight, X, CheckCircle, 
    AlertCircle, Mail, Phone, Calendar, Award, BookOpen, UserCheck
} from 'lucide-react';
import { router } from '@inertiajs/react';
import api from '../../services/api';

export default function SuperAdminUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [superAdminFilter, setSuperAdminFilter] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });
    const [actionLoading, setActionLoading] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [message, setMessage] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successUser, setSuccessUser] = useState(null);
    const [successAction, setSuccessAction] = useState(null);

    const MAIN_SUPER_ADMIN_EMAIL = 'super.admin@digilib.test';

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, superAdminFilter, pagination.current_page]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.current_page,
                per_page: pagination.per_page,
                search: searchTerm,
            };
            if (roleFilter) params.role = roleFilter;
            if (superAdminFilter) params.is_super_admin = superAdminFilter === 'true';

            const data = await api.getSuperAdminUsers(params);
            setUsers(data.data || []);
            setPagination({
                current_page: data.current_page || 1,
                last_page: data.last_page || 1,
                per_page: data.per_page || 20,
                total: data.total || 0
            });
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setShowConfirmModal(true);
    };

    const confirmAction = async () => {
        if (!selectedUser) return;
        setActionLoading(selectedUser.id);
        setShowConfirmModal(false);

        try {
            let result;
            if (actionType === 'make') {
                result = await api.makeSuperAdmin(selectedUser.email);
            } else {
                result = await api.removeSuperAdmin(selectedUser.id);
            }

            if (result.success) {
                setSuccessUser(selectedUser);
                setSuccessAction(actionType);
                setShowSuccessModal(true);
                await fetchUsers();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'action' });
        } finally {
            setActionLoading(null);
            setSelectedUser(null);
            setActionType(null);
            setTimeout(() => setMessage(null), 5000);
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: page }));
        }
    };

    const getRoleBadge = (user) => {
        const roles = user.roles || [];
        if (user.is_super_admin) {
            return {
                label: 'Super Admin',
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                icon: ShieldCheck
            };
        }
        if (roles.some(r => r.name_role === 'Administrateur biblio')) {
            return {
                label: 'Admin biblio',
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                icon: UserCheck
            };
        }
        if (roles.some(r => r.name_role === 'Bibliothécaire')) {
            return {
                label: 'Bibliothécaire',
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                icon: BookOpen
            };
        }
        return {
            label: 'Lecteur',
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            icon: Users
        };
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const getTotalSuperAdmins = () => {
        return users.filter(u => u.is_super_admin).length;
    };

    // 🔥 Vérifier si l'utilisateur a complété son profil
    const hasCompletedProfile = (user) => {
        return user.name && user.name.trim() !== '' && user.tel;
    };

    // 🔥 Obtenir le libellé du statut
    const getStatusLabel = (user) => {
        if (user.status === 'active' && hasCompletedProfile(user)) {
            return { label: 'Actif', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
        }
        if (user.status === 'active' && !hasCompletedProfile(user)) {
            return { label: 'Profil incomplet', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
        }
        return { label: 'Inactif', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    };

    return (
        <SuperAdminLayout>
            {/* En-tête */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Gestion des utilisateurs
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                            Gérez les comptes utilisateurs et les droits Super Admin
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-xl flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">
                                {getTotalSuperAdmins()} Super Admin{getTotalSuperAdmins() > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message de notification */}
            {message && (
                <div className={`mb-4 p-4 rounded-xl flex items-center justify-between ${
                    message.type === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className={message.type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}>
                            {message.text}
                        </span>
                    </div>
                    <button onClick={() => setMessage(null)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            )}

            {/* Filtres et recherche */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email ou téléphone..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Tous les rôles</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Administrateur biblio">Admin biblio</option>
                            <option value="Bibliothécaire">Bibliothécaire</option>
                            <option value="Lecteur">Lecteur</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            value={superAdminFilter}
                            onChange={(e) => {
                                setSuperAdminFilter(e.target.value);
                                setPagination(prev => ({ ...prev, current_page: 1 }));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="">Super Admin : Tous</option>
                            <option value="true">Super Admin uniquement</option>
                            <option value="false">Exclure Super Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Essayez de modifier vos filtres de recherche
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Rôle</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Statut</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {users.map((user) => {
                                        const role = getRoleBadge(user);
                                        const isSuperAdmin = user.is_super_admin;
                                        const isMainSuperAdmin = user.email === MAIN_SUPER_ADMIN_EMAIL;
                                        const status = getStatusLabel(user);
                                        
                                        return (
                                            <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                                                isSuperAdmin ? 'bg-purple-50/30 dark:bg-purple-900/10' : ''
                                            }`}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                                                            isSuperAdmin 
                                                                ? 'bg-gradient-to-br from-purple-500 to-purple-700' 
                                                                : 'bg-gradient-to-br from-orange-400 to-orange-600'
                                                        }`}>
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                                                                {user.name || 'Utilisateur sans nom'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 md:hidden">
                                                                {user.email}
                                                            </p>
                                                            {isSuperAdmin && (
                                                                <span className="inline-flex items-center gap-1 mt-1 text-xs text-purple-600 dark:text-purple-400">
                                                                    <ShieldCheck className="w-3 h-3" />
                                                                    Super Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.color}`}>
                                                        {role.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {actionLoading === user.id ? (
                                                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin mx-auto" />
                                                    ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            {isSuperAdmin ? (
                                                                isMainSuperAdmin ? (
                                                                    <span className="text-xs text-gray-400 dark:text-gray-500 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium">
                                                                        🔒 Protégé
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleAction(user, 'remove')}
                                                                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                                                        title="Retirer Super Admin"
                                                                    >
                                                                        <UserX className="w-4 h-4" />
                                                                    </button>
                                                                )
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAction(user, 'make')}
                                                                    className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                                                    title="Ajouter Super Admin"
                                                                >
                                                                    <ShieldCheck className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {pagination.current_page} / {pagination.last_page}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(pagination.current_page + 1)}
                                        disabled={pagination.current_page === pagination.last_page}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal de confirmation */}
            {showConfirmModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                actionType === 'make' 
                                    ? 'bg-purple-100 dark:bg-purple-900/30' 
                                    : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                                {actionType === 'make' ? (
                                    <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                ) : (
                                    <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {actionType === 'make' ? 'Ajouter Super Admin' : 'Retirer Super Admin'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                {actionType === 'make' 
                                    ? `Voulez-vous vraiment donner le statut Super Admin à ${selectedUser.name || selectedUser.email} ?`
                                    : `Voulez-vous vraiment retirer le statut Super Admin de ${selectedUser.name || selectedUser.email} ?`
                                }
                            </p>
                            {actionType === 'remove' && selectedUser.name && (
                                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                                    ⚠️ L'utilisateur perdra tous ses droits Super Admin
                                </p>
                            )}
                            {actionType === 'make' && (
                                <p className="text-xs text-purple-500 dark:text-purple-400 mt-2">
                                    ✅ L'utilisateur aura tous les droits d'administration de la plateforme
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors ${
                                    actionType === 'make'
                                        ? 'bg-purple-600 hover:bg-purple-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de succès */}
            {showSuccessModal && successUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                successAction === 'make' 
                                    ? 'bg-purple-100 dark:bg-purple-900/30' 
                                    : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                                {successAction === 'make' ? (
                                    <ShieldCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                ) : (
                                    <UserX className="w-8 h-8 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {successAction === 'make' ? 'Super Admin ajouté !' : 'Super Admin retiré !'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                {successAction === 'make' 
                                    ? `${successUser.name || successUser.email} est maintenant Super Administrateur.`
                                    : `Le statut Super Admin a été retiré à ${successUser.name || successUser.email}.`
                                }
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                {successAction === 'make' 
                                    ? 'L\'utilisateur a été notifié par email.'
                                    : 'L\'utilisateur a été notifié de la modification.'
                                }
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setSuccessUser(null);
                                setSuccessAction(null);
                            }}
                            className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </SuperAdminLayout>
    );
}