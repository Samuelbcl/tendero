// ============================================================
//  MODELS — assets 3D du Kenney "Mini Market" (CC0). cf. CREDITS.md.
//  Les GLB sont servis depuis public/models/ (texture atlas colormap.png
//  référencée en relatif → public/models/Textures/colormap.png).
//
//  Échelle du kit = "mini" (perso ≈ 0,72 u, mur ≈ 1 u). Le jeu est métrique
//  (1 u = 1 m, joueur 1,7 m) → on remet chaque modèle à l'échelle ici.
//  👉 Tous les réglages visuels (scale, orientation) sont CENTRALISÉS ici :
//     si un modèle est trop grand/à l'envers, ajuste une valeur et recharge.
// ============================================================
import { useGLTF } from '@react-three/drei';

export const MODELS = {
  register: '/models/cash-register.glb',
  character: '/models/character-employee.glb',
  shelf: '/models/shelf-boxes.glb',
  shelfBags: '/models/shelf-bags.glb',
  freezer: '/models/freezer.glb',
  freezerStanding: '/models/freezers-standing.glb',
  displayFruit: '/models/display-fruit.glb',
  displayBread: '/models/display-bread.glb',
  cart: '/models/shopping-cart.glb',
  column: '/models/column.glb',
} as const;

/**
 * Réglages d'échelle/orientation par usage. Dimensions natives mesurées (m) :
 *   character 0.78×0.72×0.40 · register 0.85×0.59×0.85 · shelf-boxes 0.80×0.85×0.70
 * Scale choisi pour retomber à une taille métrique crédible.
 */
export const KIT = {
  /** perso 0.72 → ~1.5 m. faceOffset : le modèle regarde +Z, on corrige si besoin. */
  characterScale: 2.1,
  characterFaceOffset: Math.PI,

  /** caisse 0.59 → ~1.0 m de haut. Abordée côté -X (client à customerSpot),
   *  donc on tourne la façade (+Z natif) vers -X. */
  registerScale: 1.7,
  registerFaceOffset: -Math.PI / 2,

  /** rayon : ~1 m de large par slot (tuilage continu). 0.80 → 1.0. */
  shelfScale: 1.25,
  shelfFaceOffset: 0,

  /** décor (freezer, displays, cart, colonnes) : échelle "humaine" du kit. */
  decorScale: 2.0,
} as const;

/** Nœuds "produits" à masquer dans les rayons kit pour obtenir un rayon VIDE. */
export const SHELF_PRODUCT_NODES = ['carton', 'box', 'bag', 'bottle', 'Group'] as const;

// Préchargement (évite le pop-in au premier affichage).
Object.values(MODELS).forEach((url) => useGLTF.preload(url));
