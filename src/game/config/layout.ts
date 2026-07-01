// ============================================================
//  LAYOUT — géométrie du magasin en DATA (cf. CLAUDE.md : positions
//  jamais en dur dans la scène). Unités = mètres. 1 unité three = 1 m.
//  La scène (Store/Shelf/Register/Customer) ET les systèmes (AI/spawner)
//  lisent ces constantes pour rester cohérents.
// ============================================================
import type { ShelfSlot, Vec3 } from '../types';

/** Pièce MVP : carrée, centrée sur l'origine. Murs aux ±HALF. */
export const ROOM = {
  size: 8, // côté en mètres
  height: 3,
  wallThickness: 0.15,
  get half() {
    return this.size / 2; // 4
  },
  /** Demi-extent jouable (le joueur ne dépasse pas ce clamp). */
  get playableHalf() {
    return this.half - 0.4;
  },
  /** Largeur de la porte (trou dans le mur avant). */
  doorWidth: 1.6,
} as const;

/** Rayon unique du MVP : contre le mur du fond (z négatif). */
export const SHELF = {
  z: -3.0, // face avant du rayon (où sont posés les produits)
  y: 0.95, // hauteur du plateau garni
  slotCount: 4,
  slotSpacing: 1.0,
  slotWidth: 0.5,
  /** distance devant le rayon où le client se place pour prendre. */
  approach: 0.8,
  maxQtyPerSlot: 8,
} as const;

/** Position monde d'un slot (centre du produit posé), par index. */
export function slotWorldPosition(index: number): Vec3 {
  const x0 = -((SHELF.slotCount - 1) * SHELF.slotSpacing) / 2; // centré
  return [x0 + index * SHELF.slotSpacing, SHELF.y, SHELF.z];
}

/** Point au sol devant un slot, où le client s'arrête pour prendre l'article. */
export function slotApproach(index: number): Vec3 {
  const [x] = slotWorldPosition(index);
  return [x, 0, SHELF.z + SHELF.approach];
}

/** id déterministe d'un slot (même valeur côté rendu et côté logique). */
export const slotId = (index: number): string => `slot-${index}`;
export const slotIndex = (id: string): number => Number(id.split('-')[1]);

/** Crée les ShelfSlot du MVP (appelé via registerShelves au montage du rayon). */
export function makeShelfSlots(): ShelfSlot[] {
  return Array.from({ length: SHELF.slotCount }, (_, i) => ({
    id: slotId(i),
    productId: null,
    qty: 0,
    maxQty: SHELF.maxQtyPerSlot,
    price: 0,
  }));
}

/** Caisse : emplacement du meuble, point d'attente client, et portée joueur. */
export const REGISTER = {
  pos: [2.6, 0, 1.2] as Vec3, // meuble
  /** où le client se place pour payer (côté intérieur du magasin). */
  customerSpot: [1.7, 0, 1.2] as Vec3,
} as const;

/** Réserve : où apparaissent les cartons livrés / de départ (coin avant-gauche). */
export const BACKROOM = {
  origin: [-3.0, 0, 2.6] as Vec3,
  spacing: 0.9, // espacement entre cartons posés
} as const;

/** Flux client : porte d'entrée → intérieur → ... → sortie. */
export const FLOW = {
  spawn: [0, 0, ROOM.half - 0.3] as Vec3, // juste dans l'embrasure
  entry: [0, 0, 1.8] as Vec3, // premier point une fois entré
  exit: [0, 0, ROOM.half + 0.6] as Vec3, // dehors → despawn
} as const;
