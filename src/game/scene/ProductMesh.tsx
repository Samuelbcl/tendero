// ============================================================
//  ProductMesh — rendu DATA-DRIVEN des produits (cf. CLAUDE.md règles 2-4).
//  - 4 meshes génériques (box/can/bottle/bag) couvrent tous les produits.
//  - skin via texture. MVP : texture PLACEHOLDER générée au canvas
//    (couleur de catégorie + nom) → aucun fichier requis, 0 erreur 404/console.
//  - un slot plein = des unités identiques → <Instances> (1 draw call), pas N meshes.
//
//  👉 PASSER À TES VRAIS PACKS (Kenney, etc.) plus tard :
//     dépose 512×512 dans public/textures/products/<id>.png puis, dans
//     `productTexture`, remplace le canvas par drei `useTexture(product.texture)`.
// ============================================================
import * as THREE from 'three';
import { Instances, Instance } from '@react-three/drei';
import type { Category, MeshType, Product } from '../types';
import { SHELF } from '../config/layout';

const CATEGORY_COLORS: Record<Category, string> = {
  'épicerie': '#e0a458',
  boissons: '#4aa3df',
  frais: '#6fcf97',
  snacks: '#eb5757',
  entretien: '#9b8cff',
};

const _texCache = new Map<string, THREE.Texture>();

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): void {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

/** Texture placeholder mémoïsée par produit (étiquette : couleur catégorie + nom). */
export function productTexture(product: Product): THREE.Texture {
  const cached = _texCache.get(product.id);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = CATEGORY_COLORS[product.category];
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(0,0,0,0.22)';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, size - 14, size - 14);
  // bandeau blanc pour le nom
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillRect(0, size * 0.6, size, size * 0.3);
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 30px system-ui, sans-serif';
  wrapText(ctx, product.name.toUpperCase(), size / 2, size * 0.75, size - 36, 30);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  _texCache.set(product.id, tex);
  return tex;
}

/** Géométrie générique selon le meshType (taille d'UNE unité en rayon). */
function geometryFor(meshType: MeshType): React.ReactElement {
  switch (meshType) {
    case 'box':
      return <boxGeometry args={[0.18, 0.22, 0.18]} />;
    case 'can':
      return <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />;
    case 'bottle':
      return <cylinderGeometry args={[0.05, 0.065, 0.26, 16]} />;
    case 'bag':
      return <boxGeometry args={[0.2, 0.26, 0.08]} />;
  }
}

const STACK_COLS = 3;
const COL_GAP = 0.16;
const ROW_GAP = 0.24;

/** Positions locales des `qty` unités dans un slot (rangées de 3, empilées). */
function stackPositions(qty: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let i = 0; i < qty; i++) {
    const col = i % STACK_COLS;
    const row = Math.floor(i / STACK_COLS);
    out.push([(col - 1) * COL_GAP, row * ROW_GAP, 0]);
  }
  return out;
}

/**
 * Pile d'unités identiques d'un produit dans un slot, rendue en INSTANCES
 * (1 seul draw call quel que soit le nombre d'unités). cf. CLAUDE.md règle 4.
 */
export function SlotStack({
  product,
  qty,
  position,
}: {
  product: Product;
  qty: number;
  position: [number, number, number];
}): React.ReactElement | null {
  if (qty <= 0) return null;
  const tex = productTexture(product);
  const positions = stackPositions(Math.min(qty, SHELF.maxQtyPerSlot));
  return (
    <group position={position}>
      <Instances limit={SHELF.maxQtyPerSlot} castShadow receiveShadow>
        {geometryFor(product.meshType)}
        <meshStandardMaterial map={tex} roughness={0.85} />
        {positions.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>
    </group>
  );
}
