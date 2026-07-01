# ROADMAP.md — Tendero

Le plan par phases. **On ne code que la phase en cours.** Chaque phase est jouable et commitée
avant de passer à la suivante.

---

## ✅ Phase 0 — Fondations (FAIT)

- [x] Squelette Vite + R3F bootable.
- [x] `types.ts` (modèle de données).
- [x] `store.ts` (zustand + actions data fonctionnelles).
- [x] `config/products.ts` (18 produits seed).
- [x] Doc set (CLAUDE / BRIEF / ARCHITECTURE / GAME-DESIGN / ASSETS).

---

## 🎯 Phase 1 — MVP : la tranche verticale (EN COURS)

> Détail complet : **BRIEF.md**.

Objectif : prouver la boucle complète en minuscule.
1 pièce · FPS · 1 carton ramassable · 1 rayon · poser · fixer prix · 1 client (pathfinding +
machine à états) · caisse manuelle · HUD.

**Done quand** : je ramasse → remplis → fixe un prix → un client achète → j'encaisse → cash monte.
60 fps, `npm run build` OK.

---

## 🔁 Phase 2 — La boucle vivante

But : ça devient un vrai petit jeu jouable en boucle.
- Plusieurs clients simultanés + **vraie file d'attente** à la caisse.
- Plusieurs produits & plusieurs rayons (utiliser tout le catalogue niveau 1).
- `economy.buyProbability` branché sur les décisions (prix qui compte vraiment).
- **Réassort** fluide (prendre N d'un coup, poser en maintenant E).
- **OrderMenu** complet (commander n'importe quel produit débloqué, délai de livraison).
- **Bilan de fin de journée** à l'écran (revenus, coûts, profit, clients servis/perdus).
- Cycle ouvrir/fermer la journée.

---

## 📈 Phase 3 — Croissance

But : la sensation de grandir.
- **Niveaux de magasin** + seuils de déblocage (cf. GAME-DESIGN §4).
- **Agrandissement de surface** (acheter une allée / des m²) + régénération du navmesh.
- **Frigos / section frais** (débloque le frais du catalogue).
- **Attractivité dynamique** (stock + variété + prix → taux de spawn).
- `config/upgrades.ts` + écran d'achats.

---

## 👥 Phase 4 — Staff & profondeur

But : déléguer et complexifier.
- **Caissier** embauchable (encaisse seul) + **réassort** (remplit les rayons depuis la réserve).
- 2ᵉ caisse.
- Plusieurs **fournisseurs** (arbitrage prix vs délai).
- Étiquettes prix visibles en rayon.
- Début péremption frais / vol à l'étalage (optionnel).

---

## 💾 Phase 5 — Confort & polish

But : un jeu qu'on garde.
- **Sauvegarde** (localStorage) + chargement.
- **Sons** & musique d'ambiance.
- **Particules / feedback** (vente, livraison, level-up).
- Écran de **stats** (courbes de profit par jour).
- **Tutoriel / objectifs** guidés.
- Passe d'assets (meilleurs PNJ, animations variées), options graphiques.

---

## Règles de transition

- Une phase ne démarre que si la précédente est **jouable de bout en bout** et commitée.
- Tout ajout doit respecter les **règles dures** de CLAUDE.md (perf, data-driven, logique/rendu séparés).
- Si une idée hors-phase surgit → la noter dans le backlog (GAME-DESIGN §7), pas la coder.
