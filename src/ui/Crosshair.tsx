// ============================================================
//  Crosshair — réticule central + indice d'action contextuel.
//  Lit la cible visée (store interaction) : ne change qu'à la cible (pas à 60fps).
// ============================================================
import { useInteractionTarget } from '@/game/hooks/useInteraction';
import { useHeldItem } from '@/game/hooks/useHeldItem';

export function Crosshair() {
  const target = useInteractionTarget();
  const held = useHeldItem();

  let hint = '';
  if (target) {
    if (target.kind === 'box' && !held) hint = 'E · Ramasser';
    else if (target.kind === 'slot') hint = held ? 'E · Poser' : 'E · Fixer le prix';
    else if (target.kind === 'register') hint = 'E · Encaisser';
  }

  return (
    <div className="crosshair-wrap">
      <div className={`crosshair ${target ? 'active' : ''}`} />
      {hint && <div className="crosshair-hint">{hint}</div>}
    </div>
  );
}
