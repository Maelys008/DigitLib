import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ActiveLibraryProvider } from './contexts/ActiveLibraryContext'; // ← Vérifie le chemin

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AuthProvider>          
        <ThemeProvider>
          <ActiveLibraryProvider>  {/* ← Vérifie que c'est bien écrit */}
            <App {...props} />
          </ActiveLibraryProvider>
        </ThemeProvider>
      </AuthProvider>
    )
  },
});