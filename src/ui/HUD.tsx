// ============================================================
//  HUD — cash / jour / niveau + objectif courant + carton tenu.
//  ⚠️ On ne s'abonne qu'à des valeurs PRIMITIVES (number/bool) : zustand ne
//  re-render que si elles changent → pas de re-render à 60 fps même si les
//  clients bougent chaque frame.
// ============================================================
import { useGame } from '@/game/store';
import { useHeldItem } from '@/game/hooks/useHeldItem';
import { productById } from '@/game/config/products';

function objective(opts: {
  queuing: boolean;
  held: boolean;
  hasUnpriced: boolean;
  hasStock: boolean;
}): string {
  if (opts.queuing) return 'Un client attend : vise la caisse et appuie sur E.';
  if (opts.held) return 'Vise le rayon et appuie sur E pour poser le produit.';
  if (opts.hasUnpriced) return 'Vise le rayon et appuie sur E pour fixer un prix.';
  if (!opts.hasStock) return 'Ramasse un carton dans la réserve (E) pour remplir le rayon.';
  return 'Magasin ouvert : sers les clients !';
}

export function HUD() {
  const cash = useGame((s) => s.cash);
  const day = useGame((s) => s.day);
  const level = useGame((s) => s.level);
  const held = useHeldItem();
  const hasStock = useGame((s) => s.shelves.some((sl) => sl.qty > 0));
  const hasUnpriced = useGame((s) => s.shelves.some((sl) => sl.qty > 0 && sl.price <= 0));
  const queuing = useGame((s) => s.customers.some((c) => c.state === 'queuing'));

  const heldProduct = held ? productById(held.productId) : undefined;

  return (
    <>
      <div className="hud-top">
        <div className="hud-stat hud-cash">{cash.toFixed(2)} €</div>
        <div className="hud-stat">Jour {day}</div>
        <div className="hud-stat">Niveau {level}</div>
      </div>

      <div className="hud-objective">{objective({ queuing, held: !!held, hasUnpriced, hasStock })}</div>

      {held && heldProduct && (
        <div className="hud-held">
          📦 En main : <b>{heldProduct.name}</b> ×{held.qty}
        </div>
      )}

      <div className="hud-controls">
        ZQSD/WASD déplacer · Souris regarder · <b>E</b> agir · <b>Tab</b> commander · <b>G</b> reposer
      </div>
    </>
  );
}
