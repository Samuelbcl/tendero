// ============================================================
//  HeldItem — le carton "tenu en main", accroché devant la caméra.
//  Visible seulement quand store.heldItem existe (ramasser/poser = rare → sélecteur OK).
//  Position calculée en impératif chaque frame (offset caméra), sans alloc.
// ============================================================
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useHeldItem } from '../hooks/useHeldItem';
import { productById } from '../config/products';
import { productTexture } from './ProductMesh';

const _off = new THREE.Vector3();
const OFFSET: [number, number, number] = [0.32, -0.26, -0.6]; // espace caméra (bas-droite)

export function HeldItem() {
  const held = useHeldItem();
  const ref = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);

  useFrame(() => {
    if (!ref.current) return;
    _off.set(OFFSET[0], OFFSET[1], OFFSET[2]).applyQuaternion(camera.quaternion);
    ref.current.position.copy(camera.position).add(_off);
    ref.current.quaternion.copy(camera.quaternion);
  });

  if (!held) return null;
  const product = productById(held.productId);
  const tex = product ? productTexture(product) : undefined;

  return (
    <group ref={ref}>
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial map={tex} color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}
