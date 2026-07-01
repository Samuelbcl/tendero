// ============================================================
//  Decor — habillage non-interactif (frigos, présentoirs, caddie, colonnes)
//  pour l'ambiance "supérette". Purement visuel : aucune interaction, aucune
//  collision (MVP). Positions ajustables ici.
// ============================================================
import type { Vec3 } from '../types';
import { MODELS, KIT } from '../config/models';
import { KitModel } from './KitModel';

interface DecorPiece {
  url: string;
  position: Vec3;
  rotationY?: number;
}

// Contre les murs, hors des chemins clients (spawn au centre, rayon au fond).
const PIECES: DecorPiece[] = [
  { url: MODELS.freezerStanding, position: [-3.3, 0, -1.4], rotationY: Math.PI / 2 },
  { url: MODELS.freezer, position: [-3.3, 0, 0.4], rotationY: Math.PI / 2 },
  { url: MODELS.displayFruit, position: [3.3, 0, -1.8], rotationY: -Math.PI / 2 },
  { url: MODELS.displayBread, position: [3.3, 0, -0.4], rotationY: -Math.PI / 2 },
  { url: MODELS.cart, position: [1.4, 0, 3.0], rotationY: 0.4 },
  { url: MODELS.column, position: [-3.5, 0, -3.5] },
  { url: MODELS.column, position: [3.5, 0, -3.5] },
];

export function Decor() {
  return (
    <group>
      {PIECES.map((p, i) => (
        <KitModel
          key={i}
          url={p.url}
          position={p.position}
          rotationY={p.rotationY ?? 0}
          scale={KIT.decorScale}
        />
      ))}
    </group>
  );
}
