// ============================================================
//  DOMAINE DU JEU — types partagés. C'est le "schéma" du projet.
//  store, systèmes et scène s'appuient tous là-dessus.
// ============================================================

export type Vec3 = [number, number, number];

/** Forme de mesh générique réutilisée pour TOUS les produits (cf. ASSETS.md). */
export type MeshType = 'box' | 'can' | 'bottle' | 'bag';

export type Category = 'épicerie' | 'boissons' | 'frais' | 'snacks' | 'entretien';

/** Définition d'un produit dans le catalogue (DATA, voir config/products.ts). */
export interface Product {
  id: string;
  name: string;
  category: Category;
  meshType: MeshType; // mesh réutilisé (on ne modélise pas chaque produit)
  texture: string; // skin -> /public/textures/products/xxx.png
  cost: number; // prix d'achat fournisseur (€/unité)
  marketPrice: number; // prix marché de référence -> pilote la demande
  caseSize: number; // nb d'unités par carton commandé
  unlockLevel: number; // niveau de magasin requis
}

/** Un emplacement de rayon : ce qu'il contient, à quel prix. */
export interface ShelfSlot {
  id: string;
  productId: string | null;
  qty: number;
  maxQty: number;
  price: number; // prix de vente fixé par le joueur (0 = non défini)
}

/** Carton physique posé dans la réserve. */
export interface StockBox {
  id: string;
  productId: string;
  qty: number;
  position: Vec3;
}

export type CustomerState =
  | 'entering' // entre dans le magasin
  | 'seeking' // se dirige vers un rayon ciblé
  | 'taking' // prend un article au rayon
  | 'queuing' // fait la queue à la caisse
  | 'paying' // en cours d'encaissement
  | 'leaving'; // sort

export interface BasketItem {
  productId: string;
  price: number; // prix payé, figé au moment de la prise en rayon
}

export interface Customer {
  id: string;
  state: CustomerState;
  position: Vec3;
  targetSlotId: string | null;
  basket: BasketItem[];
  patience: number; // 0..1, baisse en file d'attente / en cas de rupture
}

/** Objet tenu en main par le joueur (un carton). */
export interface HeldItem {
  productId: string;
  qty: number;
}

export type GamePhase = 'menu' | 'open' | 'closed' | 'paused';

/** Bilan agrégé d'une journée. */
export interface DailyStats {
  day: number;
  revenue: number;
  cogs: number; // coût des marchandises vendues
  customersServed: number;
  customersLost: number;
}
