import { create } from 'zustand';
import type {
  ShelfSlot,
  StockBox,
  Customer,
  HeldItem,
  DailyStats,
  GamePhase,
  BasketItem,
} from './types';
import { productById } from './config/products';

/**
 * LE STORE = source de vérité du jeu.
 *
 * ⚠️ RÈGLE PERF : ne JAMAIS lire/écrire l'état de jeu via useState/props dans la
 * boucle de rendu. Dans un useFrame, lire avec `useGame.getState()` (pas le hook
 * sélecteur, qui re-render). Les composants UI peuvent utiliser le sélecteur :
 *   const cash = useGame((s) => s.cash)
 *
 * Les actions ci-dessous sont la "couche data" : la scène et l'IA les appellent,
 * elles mutent l'état proprement. La logique de gameplay (IA client, économie,
 * spawn) vit dans game/systems/* et orchestre ces actions.
 */
interface GameState {
  // ---------- état ----------
  phase: GamePhase;
  cash: number;
  day: number;
  level: number;
  backroom: StockBox[]; // cartons en réserve
  shelves: ShelfSlot[]; // emplacements de rayon
  customers: Customer[];
  /**
   * IDs des clients — référence STABLE : ne change qu'à l'ajout/retrait, jamais
   * sur updateCustomer (position). Permet à la scène de s'abonner en O(1) au
   * montage/démontage des <Customer> sans réagir aux updates de position 60fps.
   */
  customerIds: string[];
  heldItem: HeldItem | null; // carton en main
  stats: DailyStats[]; // bilans des journées passées

  // ---------- actions : approvisionnement ----------
  /** Commande `cases` cartons d'un produit (débite le cash, crée les cartons en réserve). */
  orderStock: (productId: string, cases: number) => void;

  // ---------- actions : manipulation joueur ----------
  pickUpBox: (boxId: string) => void;
  dropHeld: () => void;
  /** Pose 1 unité du carton en main sur un emplacement de rayon. */
  stockShelf: (slotId: string) => void;
  setPrice: (slotId: string, price: number) => void;

  // ---------- actions : rayons (setup) ----------
  registerShelves: (slots: ShelfSlot[]) => void;

  // ---------- actions : clients ----------
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  removeCustomer: (id: string) => void;
  /** Encaisse le panier d'un client (cash += total) et le retire. */
  checkout: (customerId: string) => void;
  /**
   * Un client retire 1 unité d'un slot et l'ajoute à son panier au prix du slot
   * (prix figé). C'est le pendant "côté client" de stockShelf (cf. BRIEF §8).
   */
  customerTake: (customerId: string, slotId: string) => void;

  // ---------- cycle de jour ----------
  endDay: () => void;
}

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useGame = create<GameState>((set, get) => ({
  // ---------- état initial ----------
  phase: 'open',
  cash: 1000,
  day: 1,
  level: 1,
  backroom: [],
  shelves: [],
  customers: [],
  customerIds: [],
  heldItem: null,
  stats: [],

  // ---------- approvisionnement ----------
  orderStock: (productId, cases) => {
    const product = productById(productId);
    if (!product || cases <= 0) return;
    const cost = product.cost * product.caseSize * cases;
    if (get().cash < cost) return; // pas assez de cash
    const box: StockBox = {
      id: uid(),
      productId,
      qty: product.caseSize * cases,
      position: [0, 0, 0], // placé par <BackRoom/> à la livraison
    };
    set((s) => ({ cash: s.cash - cost, backroom: [...s.backroom, box] }));
  },

  // ---------- manipulation joueur ----------
  pickUpBox: (boxId) => {
    if (get().heldItem) return; // déjà un carton en main
    const box = get().backroom.find((b) => b.id === boxId);
    if (!box) return;
    set((s) => ({
      heldItem: { productId: box.productId, qty: box.qty },
      backroom: s.backroom.filter((b) => b.id !== boxId),
    }));
  },

  dropHeld: () => {
    const held = get().heldItem;
    if (!held) return;
    set((s) => ({
      heldItem: null,
      backroom: [
        ...s.backroom,
        { id: uid(), productId: held.productId, qty: held.qty, position: [0, 0, 0] },
      ],
    }));
  },

  stockShelf: (slotId) => {
    const held = get().heldItem;
    if (!held || held.qty <= 0) return;
    const slot = get().shelves.find((sl) => sl.id === slotId);
    if (!slot) return;
    // emplacement vide OU même produit, et pas plein
    if (slot.productId && slot.productId !== held.productId) return;
    if (slot.qty >= slot.maxQty) return;

    set((s) => ({
      shelves: s.shelves.map((sl) =>
        sl.id === slotId
          ? { ...sl, productId: held.productId, qty: sl.qty + 1 }
          : sl,
      ),
      heldItem: held.qty - 1 <= 0 ? null : { ...held, qty: held.qty - 1 },
    }));
  },

  setPrice: (slotId, price) =>
    set((s) => ({
      shelves: s.shelves.map((sl) =>
        sl.id === slotId ? { ...sl, price: Math.max(0, price) } : sl,
      ),
    })),

  // ---------- rayons (setup) ----------
  registerShelves: (slots) => set({ shelves: slots }),

  // ---------- clients ----------
  addCustomer: (c) =>
    set((s) => ({ customers: [...s.customers, c], customerIds: [...s.customerIds, c.id] })),

  updateCustomer: (id, patch) =>
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  removeCustomer: (id) =>
    set((s) => ({
      customers: s.customers.filter((c) => c.id !== id),
      customerIds: s.customerIds.filter((cid) => cid !== id),
    })),

  checkout: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;
    const revenue = customer.basket.reduce((sum, it) => sum + it.price, 0);
    set((s) => ({
      cash: s.cash + revenue,
      customers: s.customers.filter((c) => c.id !== customerId),
      customerIds: s.customerIds.filter((cid) => cid !== customerId),
    }));
  },

  customerTake: (customerId, slotId) => {
    const slot = get().shelves.find((sl) => sl.id === slotId);
    const customer = get().customers.find((c) => c.id === customerId);
    if (!slot || !customer || !slot.productId || slot.qty <= 0) return;
    const taken: BasketItem = { productId: slot.productId, price: slot.price };
    set((s) => ({
      shelves: s.shelves.map((sl) =>
        sl.id === slotId ? { ...sl, qty: sl.qty - 1 } : sl,
      ),
      customers: s.customers.map((c) =>
        c.id === customerId ? { ...c, basket: [...c.basket, taken] } : c,
      ),
    }));
  },

  // ---------- cycle de jour ----------
  endDay: () =>
    set((s) => ({
      day: s.day + 1,
      // TODO: pousser un DailyStats réel (revenue, cogs, served, lost) — voir economy.ts
    })),
}));
