// ============================================================
//  KitModel — loader générique pour un GLB STATIQUE (mobilier, décor).
//  Clone la scène (useGLTF met en cache l'original partagé), active les ombres,
//  et peut masquer des nœuds par nom (ex : vider un rayon de ses produits).
//  Non interactif : l'interaction reste gérée par les hit-zones invisibles.
// ============================================================
import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';

type GroupProps = ThreeElements['group'];

export function KitModel({
  url,
  scale = 1,
  rotationY = 0,
  hide,
  ...groupProps
}: {
  url: string;
  scale?: number;
  rotationY?: number;
  hide?: readonly string[];
} & Omit<GroupProps, 'scale' | 'rotation'>) {
  const { scene } = useGLTF(url);
  const hideKey = hide ? hide.join(',') : '';

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
      if (hide && hide.includes(o.name)) o.visible = false;
    });
    return c;
    // hideKey résume `hide` pour la mémoïsation
  }, [scene, hideKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <group scale={scale} rotation={[0, rotationY, 0]} {...groupProps}>
      {/* dispose={null} : la géométrie/texture est partagée avec le GLB en cache
          (useGLTF) — ne pas la disposer au démontage. */}
      <primitive object={cloned} dispose={null} />
    </group>
  );
}
