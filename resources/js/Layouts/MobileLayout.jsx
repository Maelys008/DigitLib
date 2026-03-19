import BottomNav from '@/Components/BottomNav';
import { useState, useEffect } from 'react';
import ProfileModal from '@/Components/ProfilDetails/ProfileModal';

export default function MobileLayout({ children, title }) {
  const [showProfile, setShowProfile] = useState(false);
// Écouter l'événement pour ouvrir le profil depuis BottomNav
  useEffect(() => {
    const handleOpenProfile = () => setShowProfile(true);
    window.addEventListener('openProfile', handleOpenProfile);
    return () => window.removeEventListener('openProfile', handleOpenProfile);
  }, []);

  return (
    <div className="min-h-screen bg-White">
      <main className="p-4 pb-20">
        {children}
      </main>
      <BottomNav />

      {/* Modal de profil */}
      <ProfileModal 
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
}