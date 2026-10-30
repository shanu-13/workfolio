"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import World from "./World";
import Drive from "./Drive";

const SKY = "#bfe6f2";

export default function Scene() {
  const [env, setEnv] = useState<{ small: boolean; reduced: boolean } | null>(null);
  useEffect(() => {
    setEnv({ small: innerWidth < 760, reduced: matchMedia("(prefers-reduced-motion: reduce)").matches });
  }, []);
  if (!env) return null;

  return (
    <div className="scene" aria-hidden>
      <Canvas
        dpr={[1, env.small ? 1.5 : 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 42, near: 0.5, far: 900, position: [0, 20, 40] }}
      >
        <color attach="background" args={[SKY]} />
        <fog attach="fog" args={[SKY, 110, 420]} />
        <hemisphereLight args={["#ffffff", "#5c8a4a", 1.4]} />
        <directionalLight position={[60, 120, 40]} intensity={2.2} />
        <Suspense fallback={null}>
          <World trees={env.small ? 260 : 520} />
          <Drive reduced={env.reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}
