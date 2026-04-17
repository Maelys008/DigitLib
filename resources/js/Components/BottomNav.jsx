import { Link, usePage, router } from "@inertiajs/react";
import { Home, Search, QrCode, User, BookOpen, Users } from "lucide-react";

export default function BottomNav() {
  const { url } = usePage();

  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/search", icon: Search, label: "Recherche" },
    { path: "/scanner", icon: QrCode, label: "Scanner" },
    { path: "/library", icon: BookOpen, label: "Bibliothèque" },
    { path: "/clubs", icon: Users, label: "Clubs" }, 
    { path: "/profile", icon: User, label: "Profil" },
  ];

  const isActive = (path) => {
    if (path === "/" && url === "/") return true;
    if (path !== "/" && url.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 pb-2 pt-1">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-all ${
                active
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Icon className={`w-6 h-6 ${active ? "scale-110" : ""}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}