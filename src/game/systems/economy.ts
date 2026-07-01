// ============================================================
//  ECONOMY — le moteur de demande. Fonctions PURES (testables).
//  cf. GAME-DESIGN.md §3. Aucune dépendance au store / au rendu.
// ============================================================

/** Au-delà de ce ratio prix/marché, plus personne n'achète. Réglable. */
export const PRICE_CEIL = 1.5;

/** smoothstep classique (transition douce 0→1 entre edge0 et edge1). */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Probabilité (0..1) qu'un client achète un produit au prix `price`
 * sachant son prix marché `marketPrice`.
 *
 *   ratio <= 1            → ~0.95  (bonne affaire)
 *   1 < ratio < CEIL      → décroît en douceur de 0.95 vers ~0.05
 *   ratio >= CEIL         → ~0.00  (trop cher, ignoré)
 */
export function buyProbability(price: number, marketPrice: number): number {
  if (price <= 0 || marketPrice <= 0) return 0;
  const ratio = price / marketPrice;
  if (ratio <= 1) return 0.95;
  if (ratio >= PRICE_CEIL) return 0.0;
  // décroissance douce 0.95 → 0.05 sur l'intervalle ]1, CEIL[
  return 0.95 - smoothstep(1, PRICE_CEIL, ratio) * 0.9;
}

/** Marge unitaire (€) d'un produit vendu à `price` acheté à `cost`. */
export function unitMargin(price: number, cost: number): number {
  return price - cost;
}
