// ============================================================
//  Shelf — le rayon du MVP : meuble + emplacements (slots).
//  - registerShelves(makeShelfSlots()) au montage (BRIEF §5.4).
//  - chaque slot a une "zone de visée" interactable (kind 'slot') TOUJOURS présente
//    (même vide) → ramassage/pose/prix possibles. Elle seule est enregistrée pour le
//    raycast (les produits empilés ne le sont pas → on vise le slot même rempli).
//  - le contenu est rendu en <SlotStack> instancié.
//
//  ⚠️ On s'abonne aux `shelves` via sélecteur : re-render seulement quand le rayon
//  change (pose, prise, prix) — jamais à 60 fps.
// ============================================================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '../store';
import { productById } from '../config/products';
import { registerInteractable } from '../hooks/useInteraction';
import {
  SHELF,
  makeShelfSlots,
  slotIndex,
  slotWorldPosition,
} from '../config/layout';
import { SlotStack } from './ProductMesh';

const SHELF_COLOR = '#9aa0a6';
const WIDTH = SHELF.slotCount * SHELF.slotSpacing + 0.2;
const DEPTH = 0.5;
const HEIGHT = 1.6;
const ZC = SHELF.z - DEPTH / 2; // centre du meuble (face avant alignée sur SHELF.z)

function Furniture() {
  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.05, ZC]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH, 0.1, DEPTH]} />
        <meshStandardMaterial color={SHELF_COLOR} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* panneau du fond */}
      <mesh position={[0, HEIGHT / 2, ZC - DEPTH / 2 + 0.03]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH, HEIGHT, 0.06]} />
        <meshStandardMaterial color={SHELF_COLOR} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* plateau (les produits posent dessus) */}
      <mesh position={[0, SHELF.y - 0.1, ZC]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH, 0.06, DEPTH]} />
        <meshStandardMaterial color={SHELF_COLOR} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* montants */}
      <mesh position={[-WIDTH / 2, HEIGHT / 2, ZC]} castShadow receiveShadow>
        <boxGeometry args={[0.06, HEIGHT, DEPTH]} />
        <meshStandardMaterial color={SHELF_COLOR} roughness={0.7} metalness={0.1} />
      </mesh>
      <mesh position={[WIDTH / 2, HEIGHT / 2, ZC]} castShadow receiveShadow>
        <boxGeometry args={[0.06, HEIGHT, DEPTH]} />
        <meshStandardMaterial color={SHELF_COLOR} roughness={0.7} metalness={0.1} />
      </mesh>
    </group>
  );
}

function SlotHit({ id, position }: { id: string; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    return registerInteractable(ref.current);
  }, []);
  return (
    <mesh ref={ref} position={position} userData={{ interactable: true, kind: 'slot', id }}>
      <boxGeometry args={[SHELF.slotWidth, 0.55, 0.42]} />
      <meshStandardMaterial transparent opacity={0.07} color="#ffffff" depthWrite={false} />
    </mesh>
  );
}

export function Shelf() {
  const shelves = useGame((s) => s.shelves);

  useEffect(() => {
    const g = useGame.getState();
    if (g.shelves.length === 0) g.registerShelves(makeShelfSlots());
  }, []);

  return (
    <group>
      <Furniture />
      {shelves.map((slot) => {
        const i = slotIndex(slot.id);
        const base = slotWorldPosition(i);
        const product = slot.productId ? productById(slot.productId) : undefined;
        return (
          <group key={slot.id}>
            <SlotHit id={slot.id} position={[base[0], SHELF.y + 0.05, SHELF.z]} />
            {product && slot.qty > 0 && (
              <SlotStack product={product} qty={slot.qty} position={base} />
            )}
          </group>
        );
      })}
    </group>
  );
}
