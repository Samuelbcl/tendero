// ============================================================
//  Customers — le "manager" : fait tourner le spawner + l'IA de chaque client
//  dans un seul useFrame, et monte/démonte les <Customer> selon le store.
//
//  Astuce perf : on s'abonne à la LISTE DES IDS (chaîne stable), pas aux positions.
//  → re-render uniquement à l'apparition/disparition d'un client, pas à chaque frame.
// ============================================================
import { useFrame } from '@react-three/fiber';
import { useGame } from '../store';
import { maybeSpawn } from '../systems/spawner';
import { stepCustomer } from '../systems/customerAI';
import { Customer } from './Customer';

export function Customers() {
  const ids = useGame((s) => s.customers.map((c) => c.id).join('|'));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // clamp (onglet en arrière-plan, etc.)
    maybeSpawn(dt);
    const list = useGame.getState().customers;
    for (let i = 0; i < list.length; i++) stepCustomer(list[i].id, dt);
  });

  const list = ids ? ids.split('|') : [];
  return (
    <>
      {list.map((id) => (
        <Customer key={id} id={id} />
      ))}
    </>
  );
}
