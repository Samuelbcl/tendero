// ============================================================
//  Player — contrôleur FPS (cf. ARCHITECTURE.md §5).
//  - PointerLockControls (drei) pour le regard, WASD pour le déplacement.
//  - Collision : clamp simple aux limites de la pièce (pas de Rapier en MVP).
//  - Raycast central chaque frame (updateInteraction) → cible visée.
//  - E = action contextuelle (ramasser / poser / prix / encaisser).
//    Tab = menu commande · Échap = fermer · G = reposer le carton.
//
//  ⚠️ Perf : tout passe par useGame.getState()/actions ; aucun re-render ici.
// ============================================================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useGame } from '../store';
import { updateInteraction, useInteractionStore } from '../hooks/useInteraction';
import { useUI, isModalOpen } from '../../ui/uiStore';
import { ROOM, REGISTER } from '../config/layout';

const SPEED = 3.2; // m/s
const PLAYER_HEIGHT = 1.7;

// Vecteurs réutilisés (aucune alloc dans useFrame).
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _move = new THREE.Vector3();

interface Keys {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
}

/** Action contextuelle E selon ce qu'on vise + ce qu'on tient. */
function handleAction(): void {
  const target = useInteractionStore.getState().target;
  if (!target) return;
  const g = useGame.getState();

  switch (target.kind) {
    case 'box':
      if (!g.heldItem && target.id) g.pickUpBox(target.id);
      break;
    case 'slot':
      if (!target.id) break;
      if (g.heldItem) g.stockShelf(target.id);
      else useUI.getState().openPrice(target.id);
      break;
    case 'register': {
      // encaisse le client arrivé à la caisse (state 'queuing', à portée du spot)
      const spot = REGISTER.customerSpot;
      const c = g.customers.find(
        (cu) =>
          cu.state === 'queuing' &&
          Math.hypot(cu.position[0] - spot[0], cu.position[2] - spot[2]) < 0.7,
      );
      if (c) g.checkout(c.id);
      break;
    }
  }
}

export function Player() {
  const camera = useThree((s) => s.camera);
  const keys = useRef<Keys>({ forward: false, back: false, left: false, right: false });

  // position de départ
  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 3);
  }, [camera]);

  // clavier
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.back = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
        case 'KeyE':
          if (document.pointerLockElement && !isModalOpen()) handleAction();
          break;
        case 'KeyG':
          if (document.pointerLockElement && !isModalOpen()) useGame.getState().dropHeld();
          break;
        case 'Tab':
          e.preventDefault();
          useUI.getState().toggleOrder();
          break;
        case 'Escape':
          useUI.getState().closeAll();
          break;
      }
    };
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keys.current.back = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // suivi de l'état PointerLock (pour l'overlay "clique pour jouer")
  useEffect(() => {
    const onChange = () => useUI.getState().setLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1) cible visée (toujours, pour le crosshair)
    updateInteraction(camera);

    // 2) déplacement (seulement souris capturée + pas de modale)
    if (!document.pointerLockElement || isModalOpen()) return;

    const k = keys.current;
    camera.getWorldDirection(_forward);
    _forward.y = 0;
    _forward.normalize();
    _right.crossVectors(_forward, _up).normalize();

    let mx = 0;
    let mz = 0;
    if (k.forward) mz += 1;
    if (k.back) mz -= 1;
    if (k.right) mx += 1;
    if (k.left) mx -= 1;

    if (mx !== 0 || mz !== 0) {
      _move.set(0, 0, 0);
      _move.addScaledVector(_forward, mz);
      _move.addScaledVector(_right, mx);
      _move.normalize().multiplyScalar(SPEED * dt);
      camera.position.x += _move.x;
      camera.position.z += _move.z;
    }

    // collision : clamp aux limites de la pièce
    const lim = ROOM.playableHalf;
    camera.position.x = Math.max(-lim, Math.min(lim, camera.position.x));
    camera.position.z = Math.max(-lim, Math.min(lim, camera.position.z));
    camera.position.y = PLAYER_HEIGHT;
  });

  return <PointerLockControls />;
}
