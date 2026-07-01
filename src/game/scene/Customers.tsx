// ============================================================
//  Customers — le "manager" : fait tourner le spawner + l'IA de chaque client
//  dans un seul useFrame, et monte/démonte les <Customer> selon le store.
//
//  Perf : on s'abonne à `customerIds` (référence stable, ne change QU'À
//  l'ajout/retrait — cf. store). updateCustomer (position, chaque frame) ne la
//  touche pas → le sélecteur renvoie la même réf (Object.is) : aucun re-render
//  ni allocation par frame. Le re-render n'a lieu qu'au spawn/despawn.
// ============================================================
import { useFrame } from '@react-three/fiber';
import { useGame } from '../store';
import { maybeSpawn } from '../systems/spawner';
import { stepCustomer } from '../systems/customerAI';
import { Customer } from './Customer';

export function Customers() {
  const ids = useGame((s) => s.customerIds);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // clamp (onglet en arrière-plan, etc.)
    maybeSpawn(dt);
    const list = useGame.getState().customers;
    for (let i = 0; i < list.length; i++) stepCustomer(list[i].id, dt);
  });

  return (
    <>
      {ids.map((id) => (
        <Customer key={id} id={id} />
      ))}
    </>
  );
}
