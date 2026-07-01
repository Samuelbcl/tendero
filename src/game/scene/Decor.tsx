// ============================================================
//  Decor — habillage minimal : SEULEMENT les frigos (section frais), non-interactifs.
//  (Présentoirs/caddie/colonnes retirés à la demande — on garde étagères + frigos
//  + caisse.) Positions ajustables ici.
// ============================================================
import type { Vec3 } from '../types';
import { MODELS, KIT } from '../config/models';
import { KitModel } from './KitModel';

interface DecorPiece {
  url: string;
  position: Vec3;
  rotationY?: number;
}

// Frigos debout alignés contre le mur droit, face à l'intérieur (-X).
const PIECES: DecorPiece[] = [
  { url: MODELS.freezerStanding, position: [3.1, 0, -1.3], rotationY: Math.PI / 2 },
  { url: MODELS.freezerStanding, position: [3.1, 0, 0.7], rotationY: Math.PI / 2 },
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
