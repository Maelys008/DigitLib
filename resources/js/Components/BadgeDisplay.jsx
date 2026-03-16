/**
 * COMPOSANT : BadgeDisplay.jsx
 * 
 * RÔLE : Affichage du badge de l'utilisateur
 * Montre visuellement le niveau de réputation de l'utilisateur
 * 
 * PROPS :
 * - badge : objet badge (nom, couleur, icône, max_livres)
 * - size : taille ('small', 'medium', 'large')
 */

export default function BadgeDisplay({ badge, size = 'medium' }) {
  if (!badge) return null;

  const sizes = {
    small: {
      container: 'px-3 py-1 text-xs',
      icon: 'text-base'
    },
    medium: {
      container: 'px-4 py-2 text-sm',
      icon: 'text-xl'
    },
    large: {
      container: 'px-6 py-3 text-base',
      icon: 'text-3xl'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className={`${badge.color} text-white rounded-full inline-flex items-center gap-2 font-semibold ${currentSize.container}`}>
      <span className={currentSize.icon}>{badge.icon}</span>
      <span>{badge.nom}</span>
    </div>
  );
}
