// ============================================================
//  Shelf — le rayon : meuble = GLB Kenney shelf-boxes VIDÉ de ses produits
//  (nœuds carton/box masqués) ; les produits posés par le joueur sont rendus
//  par-dessus en <SlotStack> instancié.
//  - un frame kit par slot (tuilage continu), aligné sur slotWorldPosition.
//  - une hit-zone invisible (kind 'slot') par slot, TOUJOURS présente → seule
//    enregistrée pour le raycast (on vise le slot même rempli).
//  - registerShelves(makeShelfSlots()) au montage (BRIEF §5.4).
//
//  ⚠️ Abonnement aux `shelves` via sélecteur : re-render seulement quand le
//  rayon change (pose/prise/prix), jamais à 60 fps.
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
import { MODELS, KIT, SHELF_PRODUCT_NODES } from '../config/models';
import { KitModel } from './KitModel';
import { SlotStack } from './ProductMesh';

function SlotHit({ id, position }: { id: string; position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    return registerInteractable(ref.current);
  }, []);
  return (
    <mesh ref={ref} position={position} userData={{ interactable: true, kind: 'slot', id }}>
      {/* largeur = slotSpacing (pas slotWidth) : les hit-zones se touchent bord à
          bord → toute la façade continue du rayon est ciblable, pas de zone morte. */}
      <boxGeometry args={[SHELF.slotSpacing, 0.55, 0.42]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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
      {shelves.map((slot) => {
        const i = slotIndex(slot.id);
        const base = slotWorldPosition(i);
        const product = slot.productId ? productById(slot.productId) : undefined;
        return (
          <group key={slot.id}>
            {/* meuble kit vidé de ses produits (un frame par slot) */}
            <KitModel
              url={MODELS.shelf}
              scale={KIT.shelfScale}
              rotationY={KIT.shelfFaceOffset}
              hide={SHELF_PRODUCT_NODES}
              position={[base[0], 0, SHELF.z]}
            />
            <SlotHit id={slot.id} position={[base[0], SHELF.y + 0.05, SHELF.z]} />
            {product && slot.qty > 0 && (
              <SlotStack product={product} qty={slot.qty} origin={[base[0], 0, SHELF.z]} />
            )}
          </group>
        );
      })}
    </group>
  );
}
