# GAME-DESIGN.md — Tendero

Le « pourquoi c'est fun » et les règles du jeu. Doc vivant.

---

## 1. Piliers de design

1. **La boucle d'optimisation.** Le plaisir vient d'ajuster prix + stock pour maximiser le profit.
   Trop cher → personne n'achète. Trop bas → tu laisses de l'argent sur la table. Rupture → clients perdus.
2. **Le geste manuel satisfaisant.** Ramasser un carton, remplir un rayon à la main : du tactile, pas du menu.
3. **La croissance lisible.** De l'épicerie d'une pièce au supermarché : chaque palier débloque visiblement
   plus d'espace, de produits, de staff.
4. **Lisibilité avant réalisme.** Low-poly clair, couleurs franches, feedback immédiat.

---

## 2. La boucle de gameplay

```
┌─> Commander du stock (OrderMenu, fournisseurs)
│       │  (délai de livraison) → cartons en réserve
│       ▼
│   Remplir les rayons à la main (carton → emplacement)
│       ▼
│   Fixer / ajuster les prix (par rapport au prix marché)
│       ▼
│   Ouvrir → les clients entrent, prennent, font la queue
│       ▼
│   Encaisser (caisse manuelle, puis caissier embauché)
│       ▼
│   Fin de journée : bilan (revenus − coûts)
│       ▼
└─< Réinvestir : agrandir, débloquer produits, embaucher, upgrades
```

---

## 3. Économie (le moteur)

### 3.1 Décision d'achat
Pour un produit en rayon, la probabilité qu'un client l'achète dépend du prix fixé vs le prix marché :

```
ratio = price / marketPrice

buyProbability(ratio):
  ratio <= 1.0           → ~0.95   (bonne affaire, achat quasi certain)
  1.0 < ratio < CEIL     → décroît (smoothstep) de 0.95 vers ~0.05
  ratio >= CEIL          → ~0.00   (trop cher, ignoré)

CEIL ≈ 1.5   (réglable dans config)
```

À coder dans `systems/economy.ts` comme **fonction pure** (testable) :
`buyProbability(price: number, marketPrice: number): number`.

> Variante d'élasticité par catégorie plus tard : l'eau est très élastique (les gens comparent),
> un produit "plaisir" l'est moins. Pour le MVP, une seule courbe suffit.

### 3.2 Marge & bilan
- Marge unitaire = `price − cost`.
- Bilan de journée : `profit = Σ(price des unités vendues) − Σ(cost des unités vendues)`.
- On suit aussi `customersServed` et `customersLost` (rupture / file trop longue / prix trop hauts).
- `DailyStats` (dans `types.ts`) stocke ça par jour pour un futur écran de stats.

### 3.3 Fréquentation
Le nombre de clients qui entrent dépend de l'**attractivité** du magasin :
- avoir du stock en rayon (le facteur n°1),
- la variété (nombre de produits différents disponibles),
- des prix compétitifs (moyenne des ratios),
- (plus tard) propreté, taille, réputation.

MVP : taux de spawn fixe. Puis : `spawnRate = base × f(attractivité, niveau)`.

---

## 4. Progression : épicerie → supermarché

On monte de **niveau de magasin** en atteignant des seuils (cash cumulé et/ou nb de ventes).
Chaque niveau débloque de l'espace, des produits (`unlockLevel` dans le catalogue) et des features.

| Niveau | Nom | Débloque |
|---|---|---|
| **1** | Petite épicerie | 1 pièce, quelques rayons, 6 produits de base. Tu fais tout. |
| **2** | Épicerie | + de rayons, +6 produits, 1ʳᵉ extension de surface, upgrade caisse. |
| **3** | Supérette | Section **frais** (frigos), section **entretien**, embauche d'un **caissier**. |
| **4** | Supermarché | Grande surface, plusieurs allées, employé **réassort**, 2ᵉ caisse. |
| **5+** | Extensions | Nouvelles sections (boulangerie…), promos, gestion plus fine. |

Le catalogue `products.ts` est déjà étagé sur `unlockLevel` 1→3 ; on étendra au-delà.

---

## 5. Économies de réinvestissement (upgrades — futur `config/upgrades.ts`)

- **Surface** : ajouter des m² / une nouvelle allée.
- **Mobilier** : rayons supplémentaires, frigos (requis pour le frais), congélateurs.
- **Caisses** : 2ᵉ / 3ᵉ caisse, tapis plus rapide.
- **Staff** : caissier (encaisse seul), réassort (remplit les rayons depuis la réserve).
- **Confort** : éclairage, déco → attractivité.

Chaque upgrade = un coût + un effet, défini en data, pas en dur.

---

## 6. Boucle de session type (ressenti visé)

> J'ouvre. Mes pâtes à 1,05 € partent vite (marché 1,10). Le café à 5,50 € (marché 4,90) ne bouge
> pas → je baisse à 4,80, ça repart. Rupture sur l'eau → je perds 3 clients, je commande 2 cartons.
> Fin de journée : +180 € de profit. J'achète un 3ᵉ rayon et je débloque les chips.

---

## 7. Backlog (au-delà du MVP, priorisé dans ROADMAP.md)

**Coeur** : file d'attente multi-clients · réassort manuel fluide · plusieurs rayons/produits ·
attractivité dynamique · bilan de fin de journée à l'écran.

**Croissance** : niveaux & déblocages · agrandissement de surface · frigos/frais · staff (caissier, réassort).

**Profondeur** : promotions, étiquettes prix · péremption du frais · vol à l'étalage / sécurité ·
plusieurs fournisseurs (prix vs délai) · cycle jour/nuit · réputation.

**Confort** : sauvegarde (localStorage) · sons & musique · particules/feedback · écran de stats ·
tutoriel/objectifs.

**Polish** : meilleurs assets, animations PNJ variées, ambiance sonore, options.
