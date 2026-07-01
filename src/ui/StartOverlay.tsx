// ============================================================
//  StartOverlay — écran "clique pour jouer".
//  Le PointerLock ne peut s'activer que sur un geste utilisateur → on clique
//  ici pour verrouiller la souris. Masqué dès que la souris est capturée
//  (sauf si une modale est ouverte).
// ============================================================
import { useUI, lockPointer } from './uiStore';

export function StartOverlay() {
  const locked = useUI((s) => s.locked);
  const priceOpen = useUI((s) => s.priceSlotId !== null);
  const orderOpen = useUI((s) => s.orderOpen);

  if (locked || priceOpen || orderOpen) return null;

  return (
    <div className="start-overlay" onClick={() => lockPointer()}>
      <div className="start-card">
        <h1>🏪 Tendero</h1>
        <p className="start-sub">Clique pour jouer</p>
        <ul className="start-controls">
          <li>
            <b>ZQSD / WASD</b> — se déplacer
          </li>
          <li>
            <b>Souris</b> — regarder
          </li>
          <li>
            <b>E</b> — ramasser · poser · fixer le prix · encaisser
          </li>
          <li>
            <b>Tab</b> — commander du stock · <b>G</b> — reposer le carton
          </li>
          <li>
            <b>Échap</b> — libérer la souris
          </li>
        </ul>
        <p className="start-goal">
          Remplis le rayon, fixe un prix, puis encaisse ton premier client. 💶
        </p>
      </div>
    </div>
  );
}
