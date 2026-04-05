import { Link, usePage, router } from "@inertiajs/react";
import { Home, Search, QrCode, User, Settings,Heart, SnailIcon } from "lucide-react";

export default function BottomNav() {
  const { url } = usePage();


  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/search", icon: Search, label: "Recherche" },
    { path: "/scanner", icon: QrCode, label: "Scanner" },
    { path: "/library", icon: Heart, label: "Bibliothèque" },
    { path: "/profile", icon: User, label: "Profil" },
    { path: "/clubs", icon: SnailIcon, label: "Clubs" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = url === item.path;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "text-purple-600 bg-purple-50"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
                <span className="text-xs mt-1 font-medium">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-gray-900 bg-gray-50"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "scale-110" : ""}`} />
              <span className="text-xs mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}