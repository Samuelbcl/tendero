// ============================================================
//  CUSTOMER AI — la machine à états du client (cf. ARCHITECTURE.md §3).
//  LOGIQUE pure de gameplay : décide les transitions et le déplacement,
//  puis applique via les ACTIONS du store. Le rendu vit dans Customer.tsx.
//
//  ⚠️ Perf : appelé chaque frame. On lit l'état via useGame.getState()
//  (jamais le hook sélecteur) et on n'alloue pas d'objet three ici
//  (calcul en nombres bruts).
// ============================================================
import type { ShelfSlot, Vec3 } from '../types';
import { useGame } from '../store';
import { productById } from '../config/products';
import { buyProbability } from './economy';
import { findPath } from './pathfinding';
import { FLOW, REGISTER, slotApproach, slotIndex } from '../config/layout';

const CUSTOMER_SPEED = 1.5; // m/s
const ARRIVE_EPS = 0.12; // m — seuil "arrivé au waypoint"
const PATIENCE_DECAY = 0.02; // par seconde, en file d'attente

/** Avance `pos` vers `dest` d'au plus `maxDist` (plan XZ). Renvoie la nouvelle pos + arrivée. */
function stepTowards(
  pos: Vec3,
  dest: Vec3,
  maxDist: number,
): { pos: Vec3; arrived: boolean } {
  const dx = dest[0] - pos[0];
  const dz = dest[2] - pos[2];
  const d = Math.hypot(dx, dz);
  if (d <= ARRIVE_EPS || d === 0) return { pos: [dest[0], 0, dest[2]], arrived: true };
  const t = Math.min(maxDist, d) / d;
  return { pos: [pos[0] + dx * t, 0, pos[2] + dz * t], arrived: false };
}

/** Choisit un slot achetable : en stock, prix défini, et au prix acceptable (proba). */
function chooseSlot(shelves: ShelfSlot[]): ShelfSlot | null {
  for (const slot of shelves) {
    if (!slot.productId || slot.qty <= 0 || slot.price <= 0) continue;
    const product = productById(slot.productId);
    if (!product) continue;
    if (Math.random() < buyProbability(slot.price, product.marketPrice)) {
      return slot;
    }
  }
  return null;
}

/**
 * Avance l'IA d'un client d'une frame. Lit/écrit le store.
 * `delta` en secondes.
 */
export function stepCustomer(id: string, delta: number): void {
  const game = useGame.getState();
  const c = game.customers.find((x) => x.id === id);
  if (!c) return;
  const step = CUSTOMER_SPEED * delta;

  switch (c.state) {
    case 'entering': {
      const dest = findPath(c.position, FLOW.entry).at(-1)!;
      const { pos, arrived } = stepTowards(c.position, dest, step);
      game.updateCustomer(id, arrived ? { position: pos, state: 'seeking' } : { position: pos });
      break;
    }

    case 'seeking': {
      if (!c.targetSlotId) {
        const slot = chooseSlot(game.shelves);
        if (!slot) {
          // rien à acheter (rupture / trop cher) : on paie ce qu'on a, sinon on part
          game.updateCustomer(id, { state: c.basket.length > 0 ? 'queuing' : 'leaving' });
        } else {
          game.updateCustomer(id, { targetSlotId: slot.id });
        }
        break;
      }
      const dest = findPath(c.position, slotApproach(slotIndex(c.targetSlotId))).at(-1)!;
      const { pos, arrived } = stepTowards(c.position, dest, step);
      game.updateCustomer(id, arrived ? { position: pos, state: 'taking' } : { position: pos });
      break;
    }

    case 'taking': {
      // retire 1 du rayon → panier (au prix du slot). MVP : 1 article puis caisse.
      if (c.targetSlotId) game.customerTake(id, c.targetSlotId);
      game.updateCustomer(id, { state: 'queuing', targetSlotId: null });
      break;
    }

    case 'queuing': {
      const { pos, arrived } = stepTowards(c.position, REGISTER.customerSpot, step);
      const patience = arrived ? Math.max(0, c.patience - PATIENCE_DECAY * delta) : c.patience;
      if (patience <= 0) {
        // file trop longue / oublié : abandon du panier
        game.updateCustomer(id, { position: pos, state: 'leaving' });
      } else {
        game.updateCustomer(id, { position: pos, patience });
      }
      // l'encaissement (checkout) est déclenché par le joueur (Register + E).
      break;
    }

    case 'leaving': {
      const { pos, arrived } = stepTowards(c.position, FLOW.exit, step);
      if (arrived) game.removeCustomer(id);
      else game.updateCustomer(id, { position: pos });
      break;
    }

    case 'paying':
      // transitoire : checkout() retire le client. Rien à faire ici en MVP.
      break;
  }
}
