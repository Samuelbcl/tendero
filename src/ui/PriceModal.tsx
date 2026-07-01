// ============================================================
//  PriceModal — fixer le prix d'un slot (BRIEF §5.7).
//  Ouverte via E sur un rayon (uiStore.priceSlotId). Montre le prix marché,
//  la marge, et la probabilité d'achat estimée pour aider le joueur.
// ============================================================
import { useEffect, useState } from 'react';
import { useUI } from './uiStore';
import { useGame } from '@/game/store';
import { productById } from '@/game/config/products';
import { buyProbability } from '@/game/systems/economy';

export function PriceModal() {
  const slotId = useUI((s) => s.priceSlotId);
  const closePrice = useUI((s) => s.closePrice);
  const setPrice = useGame((s) => s.setPrice);
  const slot = useGame((s) => (slotId ? s.shelves.find((x) => x.id === slotId) : undefined));

  const [value, setValue] = useState('');
  const product = slot?.productId ? productById(slot.productId) : undefined;

  // (ré)initialise le champ à l'ouverture : prix courant, sinon prix marché suggéré
  useEffect(() => {
    if (!slot) return;
    const suggested = slot.price > 0 ? slot.price : product?.marketPrice ?? 0;
    setValue(suggested ? suggested.toFixed(2) : '');
  }, [slotId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!slotId || !slot) return null;

  const price = parseFloat(value.replace(',', '.'));
  const valid = Number.isFinite(price) && price > 0;

  const submit = () => {
    if (valid) setPrice(slot.id, price);
    closePrice();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Fixer le prix</h2>

        {product ? (
          <>
            <div className="modal-product">
              <b>{product.name}</b> <span className="muted">({product.category})</span>
            </div>
            <div className="modal-row">
              <span>Prix d'achat</span>
              <span>{product.cost.toFixed(2)} €</span>
            </div>
            <div className="modal-row">
              <span>Prix marché</span>
              <span>{product.marketPrice.toFixed(2)} €</span>
            </div>

            <div className="price-input">
              <input
                type="number"
                step="0.05"
                min="0"
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') closePrice();
                }}
              />
              <span>€</span>
            </div>

            {valid && (
              <div className="price-feedback">
                <div className="modal-row">
                  <span>Marge unitaire</span>
                  <span className={price - product.cost >= 0 ? 'pos' : 'neg'}>
                    {(price - product.cost).toFixed(2)} €
                  </span>
                </div>
                <div className="modal-row">
                  <span>Chance d'achat</span>
                  <span>{Math.round(buyProbability(price, product.marketPrice) * 100)} %</span>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn" onClick={closePrice}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={!valid}>
                Valider
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="muted">Emplacement vide — pose d'abord un produit ici.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={closePrice}>
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
