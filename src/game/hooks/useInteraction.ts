// ============================================================
//  useInteraction — le "qu'est-ce que je regarde ?" central (cf. ARCHITECTURE.md §5).
//
//  Un raycast part du centre de l'écran chaque frame (depuis Player) et teste
//  les objets enregistrés comme interactables. La cible courante est stockée dans
//  un petit store dédié (≠ game-state) : il ne change QUE quand la cible change
//  (rare) → l'UI (Crosshair) peut s'y abonner sans re-render à 60 fps.
// ============================================================
import * as THREE from 'three';
import { create } from 'zustand';

export type InteractionKind = 'box' | 'slot' | 'register';

export interface InteractionTarget {
  kind: InteractionKind;
  id?: string; // id du carton / du slot (pas pour la caisse)
}

/** userData posée sur les meshes interactables (via la prop `userData` en JSX). */
export interface InteractableUserData {
  interactable: true;
  kind: InteractionKind;
  id?: string;
}

interface InteractionStore {
  target: InteractionTarget | null;
  setTarget: (t: InteractionTarget | null) => void;
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  target: null,
  setTarget: (target) => set({ target }),
}));

/** Sélecteur pratique pour l'UI. */
export const useInteractionTarget = (): InteractionTarget | null =>
  useInteractionStore((s) => s.target);

// --- Registre des objets interactables (rempli par les composants au montage) ---
const interactables = new Set<THREE.Object3D>();

/** À appeler au montage d'un objet interactable. Renvoie la fonction de retrait. */
export function registerInteractable(obj: THREE.Object3D): () => void {
  interactables.add(obj);
  return () => {
    interactables.delete(obj);
  };
}

// Objets réutilisés (pas d'alloc dans la boucle de rendu).
const _raycaster = new THREE.Raycaster();
const _center = new THREE.Vector2(0, 0);
const INTERACT_RANGE = 3.2; // m

function sameTarget(a: InteractionTarget | null, b: InteractionTarget | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.kind === b.kind && a.id === b.id;
}

/**
 * Recalcule la cible visée (appelé chaque frame depuis Player).
 * Met à jour le store SEULEMENT si la cible a changé.
 */
export function updateInteraction(camera: THREE.Camera): void {
  _raycaster.setFromCamera(_center, camera);
  _raycaster.far = INTERACT_RANGE;

  const hits = _raycaster.intersectObjects(Array.from(interactables), true);

  let found: InteractionTarget | null = null;
  if (hits.length > 0) {
    let obj: THREE.Object3D | null = hits[0].object;
    while (obj) {
      const ud = obj.userData as Partial<InteractableUserData>;
      if (ud && ud.interactable && ud.kind) {
        found = { kind: ud.kind, id: ud.id };
        break;
      }
      obj = obj.parent;
    }
  }

  const store = useInteractionStore.getState();
  if (!sameTarget(store.target, found)) store.setTarget(found);
}
