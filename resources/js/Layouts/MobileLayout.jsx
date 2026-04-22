import BottomNav from '@/Components/BottomNav';
import { useState, useEffect } from 'react';
import ProfileModal from '@/Components/ProfilDetails/ProfileModal';

export default function MobileLayout({ children, title, noPadding = false }) {
  const [showProfile, setShowProfile] = useState(false);
  
  useEffect(() => {
    const handleOpenProfile = () => setShowProfile(true);
    window.addEventListener('openProfile', handleOpenProfile);
    return () => window.removeEventListener('openProfile', handleOpenProfile);
  }, []);

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