// ============================================================
//  OrderMenu — commander du stock (touche Tab). Version minimale MVP :
//  liste des produits débloqués, "Commander 1 carton" → store.orderStock.
//  (Fournisseurs / délais de livraison : Phase 2, cf. ROADMAP.)
// ============================================================
import { useUI } from './uiStore';
import { useGame } from '@/game/store';
import { productsForLevel } from '@/game/config/products';

export function OrderMenu() {
  const open = useUI((s) => s.orderOpen);
  const toggleOrder = useUI((s) => s.toggleOrder);
  const cash = useGame((s) => s.cash);
  const level = useGame((s) => s.level);
  const orderStock = useGame((s) => s.orderStock);

  if (!open) return null;

  const products = productsForLevel(level);

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-wide">
        <div className="modal-head">
          <h2>Commander du stock</h2>
          <div className="hud-cash">{cash.toFixed(2)} €</div>
        </div>

        <div className="order-list">
          {products.map((p) => {
            const caseCost = p.cost * p.caseSize;
            const affordable = cash >= caseCost;
            return (
              <div className="order-row" key={p.id}>
                <div className="order-name">
                  <b>{p.name}</b>
                  <span className="muted">
                    {p.caseSize}/carton · {p.cost.toFixed(2)} €/u · marché {p.marketPrice.toFixed(2)} €
                  </span>
                </div>
                <button
                  className="btn btn-primary"
                  disabled={!affordable}
                  onClick={() => orderStock(p.id, 1)}
                >
                  Commander −{caseCost.toFixed(2)} €
                </button>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={toggleOrder}>
            Fermer (Tab)
          </button>
        </div>
      </div>
    </div>
  );
}
