// ============================================================
//  Register — la caisse. Visuel = GLB Kenney cash-register ; l'interaction
//  passe par une hit-zone invisible (kind 'register') → E = encaisser.
// ============================================================
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { registerInteractable } from '../hooks/useInteraction';
import { REGISTER } from '../config/layout';
import { MODELS, KIT } from '../config/models';
import { KitModel } from './KitModel';

export function Register() {
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    return registerInteractable(ref.current);
  }, []);

  const [x, , z] = REGISTER.pos;

  return (
    <group position={[x, 0, z]}>
      <KitModel url={MODELS.register} scale={KIT.registerScale} rotationY={KIT.registerFaceOffset} />
      {/* hit-zone invisible mais raycastable (visible=true, opacity 0) */}
      <mesh ref={ref} position={[0, 0.6, 0]} userData={{ interactable: true, kind: 'register' }}>
        <boxGeometry args={[1.4, 1.2, 1.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
