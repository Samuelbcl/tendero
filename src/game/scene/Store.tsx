// ============================================================
//  Store — la pièce : sol carrelé (kit Kenney, instancié), murs, lumières.
//  Géométrie pilotée par config/layout.ts (ROOM).
//
//  Sol : tuiles floor.glb (1×1 m) instanciées sur toute la pièce (1 draw call).
//  Murs : primitives fines (les murs kit sont trop épais à l'échelle métrique) —
//  recolorés "magasin". Collision joueur = clamp (pas de Rapier en MVP).
// ============================================================
import * as THREE from 'three';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import { ROOM } from '../config/layout';
import { MODELS } from '../config/models';

const WALL_COLOR = '#e4e2dc';

function Wall(props: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={props.position} castShadow receiveShadow>
      <boxGeometry args={props.size} />
      <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
    </mesh>
  );
}

/** Sol = tuiles floor.glb (1×1 m) instanciées sur toute la surface de la pièce. */
function Floor() {
  const { nodes, materials } = useGLTF(MODELS.floor);
  const geometry = (nodes.floor as THREE.Mesh).geometry;
  const material = materials.colormap as THREE.Material;

  const tiles: [number, number, number][] = [];
  const half = ROOM.half - 0.5; // tuiles centrées → couvre -half..+half
  for (let x = -half; x <= half; x += 1) {
    for (let z = -half; z <= half; z += 1) tiles.push([x, 0, z]);
  }

  return (
    <Instances geometry={geometry} material={material} limit={tiles.length} receiveShadow>
      {tiles.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  );
}

export function Store() {
  const h = ROOM.half;
  const t = ROOM.wallThickness;
  const H = ROOM.height;
  const y = H / 2;
  const seg = (ROOM.size - ROOM.doorWidth) / 2;
  const segX = ROOM.doorWidth / 2 + seg / 2;

  return (
    <group>
      <color attach="background" args={['#dfe7ea']} />
      <fog attach="fog" args={['#dfe7ea', 12, 26]} />

      {/* Lumières */}
      <hemisphereLight args={['#ffffff', '#9c8f76', 0.5]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-h - 2}
        shadow-camera-right={h + 2}
        shadow-camera-top={h + 2}
        shadow-camera-bottom={-h - 2}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />

      <Floor />

      {/* Murs */}
      <Wall position={[0, y, -h]} size={[ROOM.size, H, t]} />
      <Wall position={[-h, y, 0]} size={[t, H, ROOM.size]} />
      <Wall position={[h, y, 0]} size={[t, H, ROOM.size]} />
      <Wall position={[-segX, y, h]} size={[seg, H, t]} />
      <Wall position={[segX, y, h]} size={[seg, H, t]} />
    </group>
  );
}
