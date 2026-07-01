import type { Product } from '../types';

/**
 * CATALOGUE PRODUITS — data pure.
 *
 * Astuce assets : `meshType` réutilise un mesh générique, `texture` change le skin.
 * On NE modélise PAS chaque produit (voir ASSETS.md).
 *
 * Prix en € : `cost` = achat fournisseur, `marketPrice` = repère marché (pilote la demande,
 * voir GAME-DESIGN.md > Économie). `caseSize` = unités par carton commandé.
 */
export const PRODUCTS: Product[] = [
  // --- Niveau 1 : épicerie de base ---
  { id: 'pasta',     name: 'Pâtes',           category: 'épicerie',  meshType: 'box',    texture: '/textures/products/pasta.png',     cost: 0.55, marketPrice: 1.10, caseSize: 12, unlockLevel: 1 },
  { id: 'rice',      name: 'Riz',             category: 'épicerie',  meshType: 'bag',    texture: '/textures/products/rice.png',      cost: 0.80, marketPrice: 1.60, caseSize: 10, unlockLevel: 1 },
  { id: 'flour',     name: 'Farine',          category: 'épicerie',  meshType: 'bag',    texture: '/textures/products/flour.png',     cost: 0.45, marketPrice: 0.95, caseSize: 10, unlockLevel: 1 },
  { id: 'cereal',    name: 'Céréales',        category: 'snacks',    meshType: 'box',    texture: '/textures/products/cereal.png',    cost: 1.40, marketPrice: 2.80, caseSize: 8,  unlockLevel: 1 },
  { id: 'water',     name: 'Eau (1,5 L)',     category: 'boissons',  meshType: 'bottle', texture: '/textures/products/water.png',     cost: 0.30, marketPrice: 0.70, caseSize: 12, unlockLevel: 1 },
  { id: 'cola',      name: 'Cola (1,5 L)',    category: 'boissons',  meshType: 'bottle', texture: '/textures/products/cola.png',      cost: 0.75, marketPrice: 1.80, caseSize: 12, unlockLevel: 1 },

  // --- Niveau 2 : on étoffe ---
  { id: 'milk',      name: 'Lait (1 L)',      category: 'frais',     meshType: 'box',    texture: '/textures/products/milk.png',      cost: 0.65, marketPrice: 1.20, caseSize: 12, unlockLevel: 2 },
  { id: 'coffee',    name: 'Café moulu',      category: 'épicerie',  meshType: 'box',    texture: '/textures/products/coffee.png',    cost: 2.50, marketPrice: 4.90, caseSize: 6,  unlockLevel: 2 },
  { id: 'soda-can',  name: 'Soda (canette)',  category: 'boissons',  meshType: 'can',    texture: '/textures/products/soda-can.png',  cost: 0.35, marketPrice: 0.90, caseSize: 24, unlockLevel: 2 },
  { id: 'chips',     name: 'Chips',           category: 'snacks',    meshType: 'bag',    texture: '/textures/products/chips.png',     cost: 0.70, marketPrice: 1.70, caseSize: 12, unlockLevel: 2 },
  { id: 'cookies',   name: 'Biscuits',        category: 'snacks',    meshType: 'box',    texture: '/textures/products/cookies.png',   cost: 0.90, marketPrice: 2.10, caseSize: 10, unlockLevel: 2 },
  { id: 'juice',     name: "Jus d'orange",    category: 'boissons',  meshType: 'bottle', texture: '/textures/products/juice.png',     cost: 1.10, marketPrice: 2.40, caseSize: 8,  unlockLevel: 2 },

  // --- Niveau 3 : frais + entretien ---
  { id: 'yogurt',    name: 'Yaourts (x4)',    category: 'frais',     meshType: 'box',    texture: '/textures/products/yogurt.png',    cost: 0.95, marketPrice: 2.00, caseSize: 8,  unlockLevel: 3 },
  { id: 'butter',    name: 'Beurre',          category: 'frais',     meshType: 'box',    texture: '/textures/products/butter.png',    cost: 1.20, marketPrice: 2.50, caseSize: 10, unlockLevel: 3 },
  { id: 'energy',    name: 'Boisson énergie', category: 'boissons',  meshType: 'can',    texture: '/textures/products/energy.png',    cost: 0.80, marketPrice: 2.20, caseSize: 24, unlockLevel: 3 },
  { id: 'soap',      name: 'Savon',           category: 'entretien', meshType: 'box',    texture: '/textures/products/soap.png',      cost: 0.60, marketPrice: 1.50, caseSize: 12, unlockLevel: 3 },
  { id: 'detergent', name: 'Lessive',         category: 'entretien', meshType: 'bottle', texture: '/textures/products/detergent.png', cost: 2.80, marketPrice: 5.50, caseSize: 6,  unlockLevel: 3 },
  { id: 'shampoo',   name: 'Shampooing',      category: 'entretien', meshType: 'bottle', texture: '/textures/products/shampoo.png',   cost: 1.90, marketPrice: 3.90, caseSize: 8,  unlockLevel: 3 },
];

export const productById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);

/** Produits débloqués pour un niveau de magasin donné. */
export const productsForLevel = (level: number): Product[] =>
  PRODUCTS.filter((p) => p.unlockLevel <= level);
