// ============================================================
//  useHeldItem — petit sélecteur pour l'objet (carton) tenu en main.
//  Change rarement (ramasser/poser) → s'y abonner via sélecteur est OK.
// ============================================================
import { useGame } from '../store';
import type { HeldItem } from '../types';

export const useHeldItem = (): HeldItem | null => useGame((s) => s.heldItem);
