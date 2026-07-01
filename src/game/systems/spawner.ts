// ============================================================
//  SPAWNER — fait apparaître les clients. cf. ARCHITECTURE.md §2.
//  MVP : 1 client à la fois (BRIEF §5/§6). On accumule `delta` plutôt
//  qu'un setInterval (qui désync du rendu).
// ============================================================
import type { Customer } from '../types';
import { useGame, uid } from '../store';
import { FLOW } from '../config/layout';

const SPAWN_INTERVAL = 9; // s entre deux clients
const FIRST_DELAY = 3; // s avant le tout premier client
const MAX_CONCURRENT = 1; // MVP : un seul client à la fois

// État interne du système (hors store : c'est de la mécanique de spawn, pas du game-state).
let timer = SPAWN_INTERVAL - FIRST_DELAY;

function spawn(): void {
  const customer: Customer = {
    id: uid(),
    state: 'entering',
    position: [...FLOW.spawn],
    targetSlotId: null,
    basket: [],
    patience: 1,
  };
  useGame.getState().addCustomer(customer);
}

/** À appeler chaque frame. Gère le rythme d'apparition. */
export function maybeSpawn(delta: number): void {
  const game = useGame.getState();
  if (game.phase !== 'open') return;
  if (game.customers.length >= MAX_CONCURRENT) {
    timer = 0; // on ne décompte pas tant que le magasin est "plein"
    return;
  }
  timer += delta;
  if (timer >= SPAWN_INTERVAL) {
    timer = 0;
    spawn();
  }
}

/** Remet le rythme à zéro (utile au (re)démarrage d'une journée). */
export function resetSpawner(): void {
  timer = SPAWN_INTERVAL - FIRST_DELAY;
}
