// ============================================================
//  App — composition de la tranche verticale MVP (cf. BRIEF §3).
//  <Canvas> : la scène 3D. Hors Canvas : l'overlay UI (HUD, modales, réticule).
//
//  Pas de <Physics> en MVP (collision par clamp dans Player, cf. Store.tsx).
//  <Suspense> reste en place : il accueillera les assets async (glTF/textures fichier).
// ============================================================
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import { Store } from '@/game/scene/Store';
import { Decor } from '@/game/scene/Decor';
import { BackRoom } from '@/game/scene/BackRoom';
import { Shelf } from '@/game/scene/Shelf';
import { Register } from '@/game/scene/Register';
import { Customers } from '@/game/scene/Customers';
import { HeldItem } from '@/game/scene/HeldItem';
import { Player } from '@/game/scene/Player';

import { HUD } from '@/ui/HUD';
import { Crosshair } from '@/ui/Crosshair';
import { PriceModal } from '@/ui/PriceModal';
import { OrderMenu } from '@/ui/OrderMenu';
import { StartOverlay } from '@/ui/StartOverlay';

export default function App() {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 1.7, 3], fov: 75 }}>
        <Suspense fallback={null}>
          <Store />
          <Decor />
          <BackRoom />
          <Shelf />
          <Register />
          <Customers />
          <HeldItem />
          <Player />
        </Suspense>
      </Canvas>

      <div className="ui-layer">
        <HUD />
        <Crosshair />
        <PriceModal />
        <OrderMenu />
        <StartOverlay />
      </div>
    </>
  );
}
