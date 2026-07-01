// ============================================================
//  Register — la caisse. Meuble interactable (kind 'register').
//  Le joueur la vise + E pour encaisser le client en attente (→ store.checkout).
// ============================================================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { registerInteractable } from '../hooks/useInteraction';
import { REGISTER } from '../config/layout';

export function Register() {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    return registerInteractable(ref.current);
  }, []);

  const [x, , z] = REGISTER.pos;

  return (
    <group position={[x, 0, z]}>
      {/* comptoir (cible interactable) */}
      <mesh
        ref={ref}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
        userData={{ interactable: true, kind: 'register' }}
      >
        <boxGeometry args={[1.0, 1.0, 0.6]} />
        <meshStandardMaterial color="#3d6fb4" roughness={0.6} />
      </mesh>
      {/* écran de caisse */}
      <mesh position={[0.0, 1.12, -0.1]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.28, 0.05]} />
        <meshStandardMaterial color="#1b2530" emissive="#2bd6a6" emissiveIntensity={0.5} />
      </mesh>
      {/* tapis / plateau */}
      <mesh position={[0, 1.01, 0.05]} receiveShadow>
        <boxGeometry args={[0.9, 0.04, 0.5]} />
        <meshStandardMaterial color="#2b3440" roughness={0.5} />
      </mesh>
    </group>
  );
}
