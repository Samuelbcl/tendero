// ============================================================
//  Character — perso GLB RIGGÉ + animé (clients). Modèle Kenney character-employee
//  (32 clips ; on utilise idle / walk). Cloné via SkeletonUtils pour pouvoir
//  instancier plusieurs personnages animés indépendamment.
//  L'orientation/position monde est pilotée par le parent (Customer).
// ============================================================
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

export function Character({
  url,
  scale = 1,
  baseRotationY = 0,
  moving,
}: {
  url: string;
  scale?: number;
  baseRotationY?: number;
  moving: boolean;
}) {
  const { scene, animations } = useGLTF(url);

  // clone qui préserve le squelette (indispensable pour animer plusieurs instances)
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Object3D;
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.castShadow = true;
    });
    return c;
  }, [scene]);

  const group = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, cloned);

  const clip = moving ? 'walk' : 'idle';
  useEffect(() => {
    const action = actions[clip];
    if (!action) return;
    action.reset().fadeIn(0.25).play();
    return () => {
      action.fadeOut(0.25);
    };
  }, [clip, actions]);

  return (
    <group ref={group} rotation={[0, baseRotationY, 0]} scale={scale}>
      {/* dispose={null} : géométrie/texture partagée avec le GLB en cache. */}
      <primitive object={cloned} dispose={null} />
    </group>
  );
}
