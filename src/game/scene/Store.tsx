// ============================================================
//  Store — la pièce du MVP : sol, murs (avec porte), lumières.
//  Géométrie pilotée par config/layout.ts (ROOM).
//
//  Collision : gérée par clamp dans Player (pas de Rapier en MVP, cf. BRIEF §4 /
//  ARCHITECTURE §6 "physique minimale"). Rapier reviendra pour les objets jetables.
// ============================================================
import { ROOM } from '../config/layout';

const WALL_COLOR = '#cdc7bd';
const FLOOR_COLOR = '#b7a98f';

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

export function Store() {
  const h = ROOM.half;
  const t = ROOM.wallThickness;
  const H = ROOM.height;
  const y = H / 2;
  // segments du mur avant de part et d'autre de la porte
  const seg = (ROOM.size - ROOM.doorWidth) / 2;
  const segX = ROOM.doorWidth / 2 + seg / 2;

  return (
    <group>
      <color attach="background" args={['#dfe7ea']} />
      <fog attach="fog" args={['#dfe7ea', 12, 26]} />

      {/* Lumières */}
      <hemisphereLight args={['#ffffff', '#9c8f76', 0.45]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[5, 9, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-h - 2}
        shadow-camera-right={h + 2}
        shadow-camera-top={h + 2}
        shadow-camera-bottom={-h - 2}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
      />

      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM.size, ROOM.size]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={1} />
      </mesh>

      {/* Murs */}
      <Wall position={[0, y, -h]} size={[ROOM.size, H, t]} /> {/* fond */}
      <Wall position={[-h, y, 0]} size={[t, H, ROOM.size]} /> {/* gauche */}
      <Wall position={[h, y, 0]} size={[t, H, ROOM.size]} /> {/* droite */}
      {/* avant : deux segments + une porte au centre */}
      <Wall position={[-segX, y, h]} size={[seg, H, t]} />
      <Wall position={[segX, y, h]} size={[seg, H, t]} />
    </group>
  );
}
