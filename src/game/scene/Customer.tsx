// ============================================================
//  Customer — RENDU d'un client (la logique est dans systems/customerAI.ts).
//  La position vient du store mais est lue/appliquée en IMPÉRATIF dans useFrame
//  (getState + ref.position), JAMAIS via un sélecteur → 0 re-render à 60 fps.
//  La couleur de la capsule reflète l'état (lisibilité du gameplay).
// ============================================================
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../store';
import type { CustomerState } from '../types';

const STATE_COLORS: Record<CustomerState, number> = {
  entering: 0x4a90d9,
  seeking: 0x43c463,
  taking: 0xf2c94c,
  queuing: 0xf2994a,
  paying: 0xbb6bd9,
  leaving: 0x9aa0a6,
};

export function Customer({ id }: { id: string }) {
  const ref = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    const c = useGame.getState().customers.find((x) => x.id === id);
    if (!c || !ref.current) return;
    ref.current.position.set(c.position[0], 0, c.position[2]);
    const col = STATE_COLORS[c.state];
    if (mat.current && mat.current.color.getHex() !== col) mat.current.color.setHex(col);
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.8, 6, 12]} />
        <meshStandardMaterial ref={mat} color={STATE_COLORS.entering} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#e8c8a0" roughness={0.85} />
      </mesh>
    </group>
  );
}
