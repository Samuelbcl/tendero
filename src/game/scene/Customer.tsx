// ============================================================
//  Customer — RENDU d'un client (logique dans systems/customerAI.ts).
//  Position lue en IMPÉRATIF chaque frame (getState + ref), 0 re-render.
//  Visuel : perso Kenney animé — walk/idle dérivé de l'ÉTAT IA (robuste, pas de
//  flicker), orienté vers sa direction de marche.
//
//  Orientation : le GLB regarde nativement +Z, et group.rotation.y = atan2(dx,dz)
//  l'oriente DÉJÀ vers sa marche → on ne cumule PAS de faceOffset (baseRotationY=0).
// ============================================================
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../store';
import { Character } from './Character';
import { MODELS, KIT } from '../config/models';
import { REGISTER } from '../config/layout';
import type { CustomerState } from '../types';

const ARRIVE_EPS = 0.15;

/** Le client est-il "en marche" ? Dérivé de l'état IA (et non d'un delta de position). */
function isMovingState(state: CustomerState, x: number, z: number, prev: boolean): boolean {
  if (state === 'entering' || state === 'seeking' || state === 'leaving') return true;
  if (state === 'queuing') {
    return Math.hypot(REGISTER.customerSpot[0] - x, REGISTER.customerSpot[2] - z) > ARRIVE_EPS;
  }
  // 'taking' / 'paying' : transitions d'1 frame → garder l'état courant (pas de flip).
  return prev;
}

export function Customer({ id }: { id: string }) {
  const group = useRef<THREE.Group>(null);
  // pré-rempli avec la position de spawn → orientation calculée dès le 1er frame
  const last = useRef<[number, number] | null>(
    (() => {
      const c = useGame.getState().customers.find((x) => x.id === id);
      return c ? [c.position[0], c.position[2]] : null;
    })(),
  );
  // les clients spawnent en 'entering' (déjà en mouvement)
  const movingRef = useRef(true);
  const [moving, setMoving] = useState(true);

  useFrame(() => {
    const c = useGame.getState().customers.find((x) => x.id === id);
    if (!c || !group.current) return;
    const [x, , z] = c.position;
    group.current.position.set(x, 0, z);

    // orientation depuis le déplacement réel
    if (last.current) {
      const dx = x - last.current[0];
      const dz = z - last.current[1];
      if (Math.hypot(dx, dz) > 1e-4) group.current.rotation.y = Math.atan2(dx, dz);
    }
    last.current = [x, z];

    // walk/idle dérivé de l'état IA → re-render seulement au vrai changement
    const nowMoving = isMovingState(c.state, x, z, movingRef.current);
    if (nowMoving !== movingRef.current) {
      movingRef.current = nowMoving;
      setMoving(nowMoving);
    }
  });

  return (
    <group ref={group}>
      <Character url={MODELS.character} scale={KIT.characterScale} baseRotationY={0} moving={moving} />
    </group>
  );
}
