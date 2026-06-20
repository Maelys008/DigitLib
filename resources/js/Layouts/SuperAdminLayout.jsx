import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import SidebarSuperAdmin from '@/Components/ SuperAdmin/SidebarSuperAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Menu, X, ShieldCheck } from 'lucide-react';

export default function SuperAdminLayout({ children }) {
    const { user, isAuthenticated, loading } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsMobileMenuOpen(false);
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Vérifier que l'utilisateur est bien Super Admin
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.visit('/login');
            return;
        }

        if (!loading && user && !user.is_super_admin) {
            router.visit('/');
        }
    }, [loading, isAuthenticated, user]);

    // Empêcher le scroll quand le menu mobile est ouvert
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user?.is_super_admin) {
        return null;
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
            {/* Overlay pour mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - visible sur desktop, slide-in sur mobile */}
            <div className={`
                fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                md:flex md:w-64 md:flex-col md:inset-y-0
            `}>
                <SidebarSuperAdmin onItemClick={() => setIsMobileMenuOpen(false)} />
            </div>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-0">
                {/* En-tête mobile avec menu hamburger */}
                <header className="md:hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                                        DigiLib
                                    </span>
                                </h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Super Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                            aria-label="Menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            )}
                        </button>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Animation d'entrée */}
                        <div className="animate-fadeIn">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Footer léger pour mobile */}
                <footer className="md:hidden text-center py-3 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                    © 2026 DigiLib - Super Admin
                </footer>
            </div>

            {/* Styles d'animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}