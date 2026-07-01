# ASSETS.md — Tendero

Le **vrai goulot** d'un sim de magasin n'est pas le code, c'est les assets. Voici comment les
sourcer et les brancher sans se noyer.

---

## 1. Principe directeur : 4 meshes, N textures

On NE modélise PAS chaque produit. On a **4 meshes génériques** (`box`, `can`, `bottle`, `bag`),
et chaque produit n'est qu'une **texture** appliquée dessus. 18 produits = 4 meshes + 18 textures.

C'est exactement ce que fait Supermarket Simulator : des primitives + des skins.

### Convention de mapping (dans `ProductMesh.tsx`)
```
product.meshType  → quel mesh générique afficher
product.texture   → quelle image plaquer (cache via useTexture de drei)
```
Les chemins de texture sont déjà dans `config/products.ts`, ex. `/textures/products/pasta.png`.
Donc : déposer un fichier au bon chemin dans `public/textures/products/` = le produit a son skin.

---

## 2. Textures produits

### Dimensions & format
- **512×512 px**, PNG (ou WebP pour alléger). Carré, pour wrapper proprement sur les primitives.
- Pour une boîte : une texture "packaging" qui se répète sur les faces suffit au début ; affiner
  plus tard avec des UV par face si besoin.

### Où en trouver (libres de droits)
- **Kenney.nl** — packs low-poly CC0 (gratuit, usage libre). Idéal pour le style du jeu.
- **Textures CC0** : ambientCG, Poly Haven (CC0) pour des motifs/matériaux génériques.
- **Génération** : créer des packagings placeholder simples (couleur + nom + petit visuel) — largement
  suffisant pour le MVP et même au-delà. Un générateur d'étiquettes maison est une bonne idée.

> MVP : **une seule texture placeholder** (un carré coloré "PÂTES") suffit pour valider la boucle.

---

## 3. Mobilier (rayons, caisse, frigos)

- Modéliser soi-même en primitives (un rayon = quelques cubes) OU récupérer des low-poly CC0.
- Format : **glTF / GLB**. Charger avec `useGLTF` (drei).
- Garder le poly count bas ; réutiliser les mêmes meshes (instancing pour les rayons identiques).

---

## 4. PNJ (clients) — pipeline Mixamo → glTF → Draco

1. **Mixamo** (mixamo.com, gratuit) : choisir un personnage + animations (`Walking`, `Idle`,
   éventuellement `Standing` pour la file). Télécharger en FBX.
2. **Conversion FBX → glTF** : via Blender (import FBX, export glTF) ou un convertisseur en ligne.
3. **Compression Draco** : `gltf-transform` CLI —
   ```bash
   npx @gltf-transform/cli optimize in.glb out.glb --compress draco
   ```
   Réduit fortement la taille (téléchargement + mémoire GPU).
4. Charger avec `useGLTF` (drei gère le décodeur Draco). Jouer les animations via `useAnimations`.
5. **Variété** : 2-3 personnages + un teintage aléatoire des vêtements donne l'illusion d'une foule
   sans multiplier les modèles.

> MVP : un seul PNJ, voire une **capsule** (cylindre + sphère) animée en glissant le long du chemin.
> L'IA et la boucle priment ; les beaux PNJ viendront en Phase 5.

---

## 5. Organisation des fichiers

```
public/
  textures/
    products/        # pasta.png, water.png, ... (skins produits)
  models/
    shelf.glb        # mobilier
    register.glb
    customer.glb     # PNJ (Draco)
```

`public/` est servi tel quel par Vite : un chemin `/textures/products/pasta.png` pointe vers
`public/textures/products/pasta.png`. (Les chemins du catalogue sont déjà écrits ainsi.)

---

## 6. Licences (à respecter)

- **Kenney / CC0** : usage libre, y compris commercial, sans attribution requise (mais sympa de créditer).
- **Mixamo** : utilisable dans des projets, y compris commerciaux ; ne pas redistribuer les modèles bruts.
- Vérifier la licence de **chaque** asset tiers avant de l'embarquer. Tenir un fichier `CREDITS.md`
  listant sources + licences dès qu'on ajoute du tiers.
- Ne **pas** utiliser de marques/packagings réels (logos de vraies marques) → faire des marques fictives
  (le catalogue utilise déjà des noms génériques).

---

## 7. Checklist "ajouter un produit"

1. Ajouter l'entrée dans `config/products.ts` (id, meshType, texture, prix, unlockLevel…).
2. Déposer la texture dans `public/textures/products/<texture>.png` (512×512).
3. C'est tout — `ProductMesh` la charge automatiquement. Aucun code de scène à toucher.

---

## 8. Budget perf assets (repères)

- Texture produit : 512² (256² acceptable pour alléger).
- PNJ : viser < 15k tris après optimisation, animations partagées.
- Mobilier : quelques centaines de tris par pièce, instancié.
- Tout glTF lourd → **Draco**. Toute texture lourde → WebP + dimensions maîtrisées.
