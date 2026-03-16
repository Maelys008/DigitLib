// Layouts/MobileLayout.jsx - MODIFIÉ
import BottomNav from '@/Components/BottomNav'

export default function MobileLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <main className="p-4 pb-20">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}