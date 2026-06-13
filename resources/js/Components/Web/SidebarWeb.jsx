import { Link, usePage } from "@inertiajs/react";
import { Home, Search, QrCode, User, BookOpen, Users, LogOut } from "lucide-react";
import logo from '../../../images/logo .png';

export default function SidebarWeb() {
    const { url } = usePage();

    const navItems = [
        { path: "/", icon: Home, label: "Accueil" },
        { path: "/library", icon: BookOpen, label: "Bibliothèques" },
        { path: "/search", icon: Search, label: "Recherche" },
        { path: "/clubs", icon: Users, label: "Clubs" },
        { path: "/scanner", icon: QrCode, label: "Scanner" },
        { path: "/profile", icon: User, label: "Mon Profil" },
    ];

    const isActive = (path) => {
        if (path === "/" && url === "/") return true;
        if (path !== "/" && url.startsWith(path)) return true;
        return false;
    };

    return (
        <aside className="w-64 bg-gradient-to-b from-gray-300 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <img src={logo} alt="DigiLib Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">
                        <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                            DigiLib
                        </span>
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Bibliothèque numérique</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                active 
                                ? "bg-orange-100/80 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold" 
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? "text-orange-600 dark:text-orange-400" : ""}`} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-300 dark:border-gray-700">
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
                    © 2026 DigiLib
                </p>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-gray-300 dark:border-gray-700">
                <Link 
                    href="/logout" 
                    method="post" 
                    as="button" 
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Déconnexion</span>
                </Link>
            </div>
        </aside>
    );
}