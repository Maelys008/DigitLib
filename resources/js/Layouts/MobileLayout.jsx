import { useState, useEffect } from 'react';
import ProfileModal from '@/Components/ProfilDetails/ProfileModal';
import SidebarWeb from '@/Components/Web/SidebarWeb';
import NavbarWeb from '@/Components/Web/NavbarWeb';
import BottomNav from '@/Components/BottomNav';

export default function MobileLayout({ children, title, noPadding = false }) {
    const [showProfile, setShowProfile] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleOpenProfile = () => setShowProfile(true);
        window.addEventListener('openProfile', handleOpenProfile);
        
        // Vérifier la taille de l'écran
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => {
            window.removeEventListener('openProfile', handleOpenProfile);
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // Version WEB (écran ≥ 768px)
    if (!isMobile) {
        return (
            <div className="flex h-screen bg-[#F8FAFC] dark:bg-gray-900 overflow-hidden">
                <SidebarWeb />
                <div className="flex-1 flex flex-col min-w-0">
                    <NavbarWeb />
                    <main className="flex-1 overflow-y-auto p-6 md:p-10">
                        <div className="max-w-[1400px] mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
                <ProfileModal 
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                />
            </div>
        );
    }

    // Version MOBILE (écran < 768px)
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <main className={noPadding ? "pb-20" : "p-4 pb-20"}>
                {children}
            </main>
            <BottomNav />
            <ProfileModal 
                isOpen={showProfile}
                onClose={() => setShowProfile(false)}
            />
        </div>
    );
}