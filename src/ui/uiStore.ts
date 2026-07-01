// ============================================================
//  uiStore — état de l'UI (modales). SÉPARÉ du game-state.
//  Gère aussi le PointerLock : on relâche la souris quand une modale s'ouvre,
//  on la re-verrouille à la fermeture (cf. ARCHITECTURE.md §8).
// ============================================================
import { create } from 'zustand';

export function unlockPointer(): void {
  if (document.pointerLockElement) document.exitPointerLock();
}

export function lockPointer(): void {
  const canvas = document.querySelector('canvas');
  canvas?.requestPointerLock?.();
}

interface UIStore {
  priceSlotId: string | null; // slot dont on édite le prix (null = fermé)
  orderOpen: boolean; // menu de commande ouvert ?
  locked: boolean; // PointerLock actif (souris capturée) ?
  setLocked: (v: boolean) => void;
  openPrice: (slotId: string) => void;
  closePrice: () => void;
  toggleOrder: () => void;
  closeAll: () => void;
}

export const useUI = create<UIStore>((set, get) => ({
  priceSlotId: null,
  orderOpen: false,
  locked: false,
  setLocked: (v) => set({ locked: v }),

  openPrice: (slotId) => {
    set({ priceSlotId: slotId, orderOpen: false });
    unlockPointer();
  },
  closePrice: () => {
    set({ priceSlotId: null });
    lockPointer();
  },
  toggleOrder: () => {
    const open = !get().orderOpen;
    set({ orderOpen: open, priceSlotId: null });
    if (open) unlockPointer();
    else lockPointer();
  },
  closeAll: () => {
    const wasOpen = get().priceSlotId !== null || get().orderOpen;
    set({ priceSlotId: null, orderOpen: false });
    if (wasOpen) lockPointer();
  },
}));

/** Vrai si une modale est ouverte (bloque les actions de jeu). */
export const isModalOpen = (): boolean => {
  const s = useUI.getState();
  return s.priceSlotId !== null || s.orderOpen;
};
