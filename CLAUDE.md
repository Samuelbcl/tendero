# CLAUDE.md — Constitution du projet Tendero

> Claude Code lit ce fichier à **chaque** session. C'est la loi du projet.
> Pour la mission de la 1ʳᵉ session, voir **BRIEF.md**.

---

## Le projet en une phrase

Simulateur de gestion de magasin en 3D web (façon Supermarket Simulator) :
commander du stock → remplir les rayons → fixer les prix → encaisser les clients → réinvestir.
On démarre **épicerie**, on grandit jusqu'au **supermarché**.

---

## ⚠️ Règles dures (non négociables)

1. **Perf : aucun état de jeu via `useState`/props pour ce qui est lu chaque frame.**
   Tout passe par le store zustand (`useGame`). Dans un `useFrame`, lire avec
   `useGame.getState()` (pas le hook sélecteur, qui re-render). Re-render React à 60 fps = mort du jeu.

2. **Produits = data, pas du code.** Jamais un composant/fichier par produit.
   Tout est dans `game/config/products.ts`. Un produit = un `meshType` générique + une `texture`.

3. **Meshes génériques + swap de texture.** 4 meshes (`box`, `can`, `bottle`, `bag`) couvrent
   tous les produits. On ne modélise pas 200 objets. (cf. ASSETS.md)

4. **Produits identiques sur un rayon → `InstancedMesh`** (drei `<Instances>`), jamais N `<mesh>`.

5. **Logique séparée du rendu.** `game/systems/*.ts` = logique pure (testable),
   `game/scene/*.tsx` = rendu. Ex : `customerAI.ts` décide, `Customer.tsx` affiche.

6. **TypeScript strict.** Pas de `any` non justifié par un commentaire.

7. **On ne sort pas du scope de la phase en cours** (voir ROADMAP.md). MVP d'abord, point.

---

## Stack (figé — ne pas substituer)

| | |
|---|---|
| Bundler | Vite 8 |
| Langage | TypeScript 6 strict |
| React | 19 |
| Moteur 3D | @react-three/fiber **9** (PAS la v10 alpha) |
| Helpers | @react-three/drei 10 |
| Physique | @react-three/rapier **2** (WASM, à wrapper dans `<Suspense>`) |
| three.js | 0.185 (suit R3F, ne pas downgrade) |
| État | zustand 5 |
| Nav clients | three-pathfinding |

Imports : alias `@/` → `src/` (ex : `import { useGame } from '@/game/store'`).

---

## Architecture (résumé — détail dans ARCHITECTURE.md)

- **`game/store.ts`** — LA source de vérité (cash, jour, niveau, réserve, rayons, clients, objet en main).
  Déjà câblé avec les actions data : `orderStock`, `pickUpBox`, `stockShelf`, `setPrice`, `checkout`, etc.
- **`game/types.ts`** — le modèle de données. Toute la base s'appuie dessus.
- **`game/config/`** — `products.ts` (catalogue). À venir : `suppliers.ts`, `upgrades.ts`.
- **`game/systems/`** — `customerAI.ts`, `economy.ts`, `spawner.ts`, `pathfinding.ts` (logique pure).
- **`game/scene/`** — `Store`, `Shelf`, `ProductMesh`, `Customer`, `Register`, `BackRoom`, `Player`.
- **`game/hooks/`** — `useInteraction` (raycast central « qu'est-ce que je regarde »), `useHeldItem`.
- **`ui/`** — `HUD`, `PriceModal`, `OrderMenu`, `Crosshair` — HTML par-dessus le `<Canvas>`
  (dans `<div className="ui-layer">`, `pointer-events` réactivés par élément).

**Flux** : joueur/IA appelle une **action du store** → le store mute l'état → la scène re-rend
uniquement ce qui a changé.

---

## Conventions

- Commits petits, fréquents, en français : `feat:`, `fix:`, `chore:`, `refactor:`.
- Un système / un composant par fichier.
- Commenter le **pourquoi**, pas le quoi.
- Données de jeu (prix, délais, seuils) → toujours dans `config/`, jamais en dur dans la scène.
- Unités : distances en **mètres** (échelle three), argent en **€**, temps en **secondes de jeu**.
- Échelle : 1 unité three = 1 mètre. Le joueur (caméra FPS) à ~1,7 m. Rayons ~2 m de haut.

---

## Definition of Done (par incrément)

- `npm run dev` tourne, **0 erreur console**, 60 fps sur la scène.
- `npm run build` passe (tsc strict OK).
- La feature est **jouable de bout en bout** (pas juste « le code existe »).
- Commit propre.

---

## Anti-objectifs (ne PAS faire)

- Pas de backend / multijoueur (jeu solo, 100 % client).
- Pas de réalisme photo : low-poly assumé.
- Pas de `localStorage` tant que la sauvegarde n'est pas une phase planifiée (ROADMAP).
- Pas de sur-ingénierie : la boucle jouable prime sur l'abstraction parfaite.
- Pas de dépendance lourde ajoutée sans raison (rester sur le stack ci-dessus).

---

## Pièges connus (à éviter)

- **StrictMode** retiré volontairement dans `main.tsx` (double-montage = double-init physique/boucle).
- **Rapier** est lazy/WASM : le `<Physics>` doit être sous `<Suspense>`.
- Quaternions/vecteurs Rapier ≠ three : utiliser les helpers `vec3`, `quat`, `euler` de `@react-three/rapier`.
- Ne pas créer d'objets three (Vector3, etc.) **dans** `useFrame` : les allouer une fois hors boucle (GC).
