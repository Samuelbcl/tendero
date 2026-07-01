import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';

// Pas de <StrictMode> ici : en dev il double-monte les composants, ce qui
// peut dédoubler l'init physique/boucle de jeu avec three (objets impératifs).
// Choix volontaire de game-dev. Le réactiver seulement si besoin de debug strict.
createRoot(document.getElementById('root')!).render(<App />);
