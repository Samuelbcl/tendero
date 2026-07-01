# ARCHITECTURE.md — Tendero

Comment le jeu est câblé. À lire après CLAUDE.md, avant de coder un système.

---

## 1. Vue d'ensemble

```
                         ┌─────────────────────────┐
                         │   game/store.ts (zustand)│  ← LA source de vérité
                         │  cash, day, level,       │
                         │  backroom, shelves,      │
                         │  customers, heldItem     │
                         └───────────┬─────────────┘
            lit / mute via actions   │   lit (sélecteurs) pour l'UI
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
   SYSTEMS (logique)            SCENE (rendu 3D)              UI (HTML overlay)
   game/systems/*.ts            game/scene/*.tsx              ui/*.tsx
   - spawner                    - Store / Shelf               - HUD
   - customerAI                 - ProductMesh / Customer      - PriceModal
   - economy                    - Register / BackRoom         - OrderMenu
   - pathfinding                - Player (FPS + raycast)      - Crosshair
```

**Principe** : un seul store. Les *systèmes* contiennent la logique (décisions), la *scène* affiche,
l'*UI* est du HTML par-dessus le `<Canvas>`. Tout le monde communique via les actions du store.

---

## 2. Boucle de jeu & ticks

- R3F fournit `useFrame((state, delta) => ...)` = la boucle de rendu (~60 fps).
- **Logique temps réel** (déplacement clients, IA) : dans `useFrame`, mais lire l'état via
  `useGame.getState()` (pas le hook sélecteur). Écrire via les actions.
- **Logique périodique** (spawn d'un client toutes les X s, bilan de fin de journée) : accumuler
  `delta` dans une ref et déclencher au seuil, plutôt qu'un `setInterval` (qui désync du rendu).
- Ne **jamais** allouer d'objets three (`new THREE.Vector3()`, etc.) dans `useFrame` : les créer
  une fois hors boucle et les réutiliser (sinon pression GC → micro-freezes).

---

## 3. Machine à états du client (cœur du gameplay)

`game/systems/customerAI.ts` = la logique (fonction pure de transition).
`game/scene/Customer.tsx` = le rendu + appelle l'IA chaque frame.

```
            ┌──────────┐
            │ entering │  marche vers l'intérieur
            └────┬─────┘
                 │ arrivé dans le magasin
                 ▼
            ┌──────────┐   choisit un produit en rayon, en stock,
            │ seeking  │   au prix acceptable → cible un slot
            └────┬─────┘
                 │ atteint le slot
                 ▼
            ┌──────────┐   retire 1 du rayon, ajoute au panier (prix figé)
            │  taking  │
            └────┬─────┘
        veut encore ? │ oui → seeking
                 │ non
                 ▼
            ┌──────────┐   se met dans la file de la caisse
            │ queuing  │
            └────┬─────┘
                 │ en tête de file ET caisse opérée
                 ▼
            ┌──────────┐   le joueur (ou caissier) appelle checkout()
            │  paying  │
            └────┬─────┘
                 │ encaissé
                 ▼
            ┌──────────┐   marche vers la sortie → despawn
            │ leaving  │
            └──────────┘

Transitions spéciales :
- slot vide / trop cher en `seeking` → patience-- → re-seek un autre produit, sinon `leaving`.
- patience <= 0 (file trop longue, etc.) → `leaving` en abandonnant le panier.
```

**Décision d'achat** (déléguée à `economy.ts`) : voir GAME-DESIGN.md > Économie.
En `seeking`, le client ne cible que des slots dont `buyProbability(price, marketPrice)` est non négligeable.

---

## 4. Pathfinding

`game/systems/pathfinding.ts` = wrapper autour de `three-pathfinding`.

- Construire **une zone de navigation** à partir d'un mesh de sol simplifié (le "navmesh"),
  excluant l'emprise des rayons/caisse (obstacles).
- API : `findPath(start, end, zone, group)` → liste de points. Le `Customer` suit ces points
  (lerp position vers le prochain waypoint, avance dans `useFrame`).
- MVP : navmesh trivial (une pièce rectangulaire avec un trou pour le rayon). Pas besoin de
  recalcul dynamique tant que les obstacles ne bougent pas.
- Plus tard (agrandissement) : régénérer le navmesh quand le layout change.

> Alternative si `three-pathfinding` pose souci : grille A* maison sur une matrice d'occupation
> (cases libres/occupées). Plus simple à debugger, suffisant pour des layouts en damier.

---

## 5. Interaction joueur (FPS)

`game/scene/Player.tsx` + `game/hooks/useInteraction.ts`.

- `PointerLockControls` (drei) verrouille la souris → look. WASD = déplacement
  (translation dans le plan, selon l'orientation caméra).
- **Raycast central** : à chaque frame, un rayon part du centre de l'écran. Le 1ᵉʳ objet
  "interactable" touché (tag via `userData.interactable` ou via une couche/layer) devient la cible.
- `useInteraction` expose `{ target, type }` (ex. `{ type: 'box', id }`, `{ type: 'slot', id }`,
  `{ type: 'register' }`). Le `Crosshair` change selon la cible (icône ramasser/poser/encaisser).
- Touche **E** = action contextuelle sur la cible → appelle l'action store correspondante.
- `useHeldItem` : si un carton est en main (`store.heldItem`), afficher un proxy mesh attaché à la
  caméra (le carton "tenu").

---

## 6. Physique (Rapier)

- `<Physics>` (sous `<Suspense>`, c'est du WASM) englobe la scène jouable.
- Usage MVP **minimal** : collisions murs (colliders fixes), éventuellement le carton posé.
- Les clients **ne sont pas** des rigidbodies pilotés par la physique : leur position est dirigée
  par le pathfinding (kinematic / transform direct). La physique sert surtout aux objets "jetables"
  (cartons) et aux murs.
- Helpers de conversion Rapier↔three : `vec3`, `quat`, `euler` depuis `@react-three/rapier`.

---

## 7. Rendu & perf

- **ProductMesh** : un mesh générique par `meshType` (`box`/`can`/`bottle`/`bag`), le matériau
  charge la `texture` du produit (`useTexture` de drei, mis en cache). Le même mesh sert à 50 produits.
- **Instancing** : un rayon plein de pâtes identiques = 1 `<Instances>` + N `<Instance>`
  (drei), pas N meshes. Indispensable dès qu'on a beaucoup d'unités à l'écran.
- **Lumières** : 1 directionnelle (ombres) + ambiante. Limiter les ombres dynamiques.
- **LOD / instancing clients** : pas pour le MVP. À considérer quand >10 clients simultanés.
- Modèles lourds (PNJ) : glTF **compressé Draco** (voir ASSETS.md).

---

## 8. UI overlay

- Tout l'UI HTML vit dans `<div className="ui-layer">` **hors** du `<Canvas>`.
- `.ui-layer` a `pointer-events: none` ; chaque élément interactif (bouton, modale) réactive
  `pointer-events: auto`. Ça laisse passer les clics vers le jeu sauf sur l'UI.
- Quand une modale est ouverte (`PriceModal`, `OrderMenu`), **relâcher le PointerLock** pour
  rendre le curseur, et le re-verrouiller à la fermeture.
- L'UI lit le store via sélecteurs : `const cash = useGame((s) => s.cash)`.

---

## 9. Où vit quoi (récap)

| Besoin | Fichier |
|---|---|
| État du jeu | `game/store.ts` |
| Types | `game/types.ts` |
| Catalogue / réglages | `game/config/*` |
| Décisions clients | `game/systems/customerAI.ts` |
| Prix / demande / bilan | `game/systems/economy.ts` |
| Apparition clients | `game/systems/spawner.ts` |
| Navigation | `game/systems/pathfinding.ts` |
| Rendu monde/objets | `game/scene/*` |
| Contrôleur + raycast | `game/scene/Player.tsx` + `game/hooks/useInteraction.ts` |
| HUD / modales | `ui/*` |
