# Tendero 🏪

Simulateur de gestion de magasin en 3D web, façon *Supermarket Simulator*.
On démarre **petite épicerie** → on grandit jusqu'au **supermarché**.

Studio Biancola · full-code React Three Fiber.

---

## 🚀 Démarrer

```bash
npm install
npm run dev      # http://localhost:5173
```

Si tu vois un **sol beige + un cube rouge** que tu peux tourner à la souris : la toolchain marche. ✅
Le `src/App.tsx` actuel est un **placeholder (smoke test)** à remplacer dès la 1ʳᵉ session de dev (voir `BRIEF.md` §5).

```bash
npm run build    # tsc strict + build prod
npm run preview  # sert le build
```

---

## 📚 Le dossier — à lire dans cet ordre

| Fichier | Quoi |
|---|---|
| **CLAUDE.md** | ⭐ Constitution du projet. À lire à **chaque** session Claude Code. |
| **BRIEF.md** | La mission de la 1ʳᵉ session : la tranche verticale MVP (les 10 points). |
| **GAME-DESIGN.md** | La boucle de jeu, le modèle économique, la progression épicerie→supermarché. |
| **ARCHITECTURE.md** | Comment c'est câblé : systèmes, état, machine à états client, rendu. |
| **ROADMAP.md** | Le plan par phases (v0.1 MVP → v1.0). |
| **ASSETS.md** | Le pipeline assets (le vrai goulot : textures, PNJ Mixamo, Draco). |

---

## 🗂️ Structure

```
tendero/
├─ index.html
├─ package.json          # versions figées
├─ vite.config.ts        # alias @ -> src/, exclusion WASM Rapier
├─ tsconfig.json         # strict
├─ public/
│  ├─ textures/products/ # skins produits (à remplir, voir ASSETS.md)
│  └─ models/            # glTF (rayons, PNJ…)
└─ src/
   ├─ main.tsx
   ├─ App.tsx            # <Canvas> (placeholder smoke test)
   ├─ index.css
   ├─ game/
   │  ├─ types.ts        # le "schéma" (modèle de données)
   │  ├─ store.ts        # zustand — source de vérité + actions data (déjà câblé)
   │  ├─ config/
   │  │  └─ products.ts  # catalogue (18 produits seed)
   │  ├─ systems/        # customerAI, economy, spawner, pathfinding  (à créer)
   │  ├─ scene/          # Store, Shelf, ProductMesh, Customer, Register, BackRoom, Player (à créer)
   │  └─ hooks/          # useInteraction, useHeldItem  (à créer)
   └─ ui/                # HUD, PriceModal, OrderMenu, Crosshair  (à créer)
```

Ce qui est **déjà fait** : tout le squelette technique + la couche de données (`types.ts`, `store.ts` avec ses actions, `products.ts`). Ce qui reste : la scène 3D, les systèmes de gameplay et l'UI — c'est le boulot des sessions (voir ROADMAP.md).

---

## 🧱 Stack

React 19 · Vite 8 · TypeScript 6 (strict) · @react-three/fiber 9 · drei 10 · rapier 2 · three 0.185 · zustand 5 · three-pathfinding.

Versions exactes : `package.json`.
