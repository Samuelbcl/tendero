// ============================================================
//  BackRoom — la "réserve" : les cartons posés au sol, ramassables (raycast + E).
//  - Seed au montage : un peu de stock de départ (via orderStock) pour que la
//    boucle soit jouable immédiatement (BRIEF §5.3).
//  - Chaque carton est un mesh interactable (kind 'box') enregistré pour le raycast.
// ============================================================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '../store';
import { productById } from '../config/products';
import { productTexture } from './ProductMesh';
import { registerInteractable } from '../hooks/useInteraction';
import { BACKROOM } from '../config/layout';
import type { StockBox } from '../types';

const BOX = 0.5; // côté du carton (m)

function boxPosition(i: number): [number, number, number] {
  const cols = 3;
  const col = i % cols;
  const row = Math.floor(i / cols);
  return [
    BACKROOM.origin[0] + col * BACKROOM.spacing,
    BOX / 2,
    BACKROOM.origin[2] + row * BACKROOM.spacing,
  ];
}

function CardboardBox({
  box,
  position,
}: {
  box: StockBox;
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    return registerInteractable(ref.current);
  }, []);

  const product = productById(box.productId);
  const tex = product ? productTexture(product) : undefined;

  return (
    <mesh
      ref={ref}
      position={position}
      castShadow
      receiveShadow
      userData={{ interactable: true, kind: 'box', id: box.id }}
    >
      <boxGeometry args={[BOX, BOX, BOX]} />
      <meshStandardMaterial map={tex} color="#ffffff" roughness={0.9} />
    </mesh>
  );
}

export function BackRoom() {
  const backroom = useGame((s) => s.backroom);

  // Seed du stock de départ (une seule fois, si la réserve est vide).
  useEffect(() => {
    const g = useGame.getState();
    if (g.backroom.length === 0) {
      g.orderStock('pasta', 1);
      g.orderStock('water', 1);
    }
  }, []);

  return (
    <group>
      {backroom.map((box, i) => (
        <CardboardBox key={box.id} box={box} position={boxPosition(i)} />
      ))}
    </group>
  );
}
