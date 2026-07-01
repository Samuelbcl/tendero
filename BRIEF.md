# BRIEF.md — Mission 1ʳᵉ session : la tranche verticale MVP

> Master prompt pour la session de démarrage de **Tendero**.
> Conventions & règles dures : voir **CLAUDE.md**. Plan global : **ROADMAP.md**.

---

## 0. Règle d'or de cette session

**On ne construit PAS le jeu entier. On construit la TRANCHE VERTICALE du MVP (§5), elle tourne, point.**
Aucune feature hors scope MVP tant que la boucle de base n'est pas jouable et commitée.
En cas d'hésitation entre « faire propre/générique » et « faire marcher la boucle » → faire marcher la boucle.

---

## 1. Ce qui existe déjà (ne pas refaire)

- Squelette Vite + R3F bootable (`npm run dev` affiche un smoke test).
- `game/types.ts` — le modèle de données complet.
- `game/store.ts` — zustand + **toutes les actions data déjà écrites et fonctionnelles**
  (`orderStock`, `pickUpBox`, `dropHeld`, `stockShelf`, `setPrice`, `addCustomer`, `updateCustomer`,
  `removeCustomer`, `checkout`, `registerShelves`, `endDay`).
- `game/config/products.ts` — 18 produits seed.

➡️ Le boulot de la session = **la scène 3D + l'IA d'un client + l'interaction + un HUD minimal**,
en branchant tout sur les actions du store qui existent déjà.

---

## 2. La boucle à prouver (le « battement de cœur »)

```
Carton en réserve → le ramasser → viser un rayon → poser → fixer un prix
       → un client entre → va au rayon → prend l'article → va à la caisse
       → je l'encaisse → le cash monte
```

---

## 3. Sortir le placeholder

`src/App.tsx` est un smoke test. Le remplacer par la vraie structure :

```tsx
<Canvas shadows>
  <Suspense>
    <Physics>
      <Store />        {/* sol + murs + lumières */}
      <BackRoom />     {/* le(s) carton(s) ramassable(s) */}
      <Shelf />        {/* 1 rayon + emplacements */}
      <Register />     {/* la caisse */}
      <Customer ... /> {/* via le spawner */}
      <Player />       {/* FPS + raycast d'interaction */}
    </Physics>
  </Suspense>
</Canvas>
{/* hors Canvas : */}
<div className="ui-layer"><HUD /><Crosshair /><PriceModal/><OrderMenu/></div>
```

---

## 4. Échelle & contrôles

- 1 unité = 1 m. Caméra FPS à ~1,7 m. Rayon ~2 m. Pièce ~8×8 m pour le MVP.
- Déplacement : `PointerLockControls` (drei) + WASD. Collision murs basique (Rapier ou simple clamp).
- Interaction : **raycast central** (hook `useInteraction`) → détecte l'objet visé.
  Touche **E** = action contextuelle (ramasser carton / poser sur rayon / encaisser).
  Sur un rayon : ouvrir `PriceModal`. Commander : `OrderMenu` (touche dédiée, ex. **Tab**).

---

## 5. SCOPE DU MVP — la seule chose à livrer

1. **1 pièce** fermée (sol + murs + lumière), vue première personne.
2. **Contrôleur FPS** : PointerLock + WASD + collision murs.
3. **Réserve** : 1 carton au sol, **ramassable** (raycast + E) → branché sur `pickUpBox`.
4. **1 rayon** avec emplacements vides (créés via `registerShelves` au montage).
5. **Remplir** : carton en main → viser le rayon → E → 1 unité posée (`stockShelf`), le mesh apparaît.
6. **1 produit** suffit pour le MVP (ex. `pasta`) — 1 mesh `box` + 1 texture (placeholder OK).
7. **Prix** : viser le rayon → `PriceModal` → `setPrice`.
8. **1 client** : `spawner` en crée un → `customerAI` le fait pathfind au rayon (`three-pathfinding`)
   → `taking` (retire 1 du rayon, ajoute au panier au prix du slot) → pathfind à la caisse → `queuing`.
9. **Caisse** : client en attente → viser la caisse → E → `checkout` → `cash += panier`.
10. **HUD** : cash + jour + objectif courant.

C'est tout. Quand ces 10 points tournent et sont commités → MVP **DONE**.

### Definition of Done (MVP)
- [ ] `npm run dev` : 0 erreur console, 60 fps.
- [ ] Je ramasse le carton, je remplis le rayon, je fixe un prix.
- [ ] Un client apparaît, prend le produit, va à la caisse, je l'encaisse, le cash monte.
- [ ] `npm run build` passe.
- [ ] Code typé strict, commits propres en français.

---

## 6. Hors-scope MVP (backlog — NE PAS coder maintenant)

File d'attente multi-clients · embaucher un caissier · plusieurs produits/rayons · agrandir la surface ·
frigos / rayons spéciaux · jour/nuit · sauvegarde · réappro auto · sons · particules ·
scan d'articles à la caisse · attractivité du magasin · concurrence.
→ Tout ça est planifié dans **ROADMAP.md**.

---

## 7. Ordre d'exécution suggéré

1. `Store.tsx` (pièce : sol, murs, lumières) — remplacer le smoke test.
2. `Player.tsx` (FPS PointerLock + déplacement + collision).
3. `hooks/useInteraction.ts` (raycast central « qu'est-ce que je regarde »).
4. `BackRoom.tsx` + carton ramassable (E → `pickUpBox`) + `hooks/useHeldItem`.
5. `scene/ProductMesh.tsx` (mesh générique + texture) puis `Shelf.tsx` + E → `stockShelf`.
6. `ui/PriceModal.tsx` + `ui/Crosshair.tsx` + E/clic → `setPrice`.
7. `systems/pathfinding.ts` (wrapper navmesh) + `systems/spawner.ts` (1 client).
8. `systems/customerAI.ts` + `scene/Customer.tsx` (machine à états, cf. ARCHITECTURE.md).
9. `Register.tsx` + E → `checkout`.
10. `ui/HUD.tsx`. Polish jusqu'à la Definition of Done.

---

**Rappel : la boucle minuscule d'abord. On itère ensuite (ROADMAP).**
