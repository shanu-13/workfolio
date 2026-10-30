"use client";

import { useRef } from "react";
import {
  motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity,
} from "framer-motion";
import { marquee } from "@/content/site";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function Row({ base, reverse = false }: { base: number; reverse?: boolean }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 5], { clamp: false });
  const dir = useRef(reverse ? -1 : 1);
  const xPct = useTransform(x, v => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    // scrolling flips direction and speeds the band up
    if (boost.get() < 0) dir.current = reverse ? 1 : -1;
    else if (boost.get() > 0) dir.current = reverse ? -1 : 1;
    x.set(x.get() - dir.current * base * (delta / 1000) * (1 + Math.abs(boost.get())));
  });

  const items = [...marquee, ...marquee];
  return (
    <div className="marquee-row">
      <motion.div className="marquee-track" style={{ x: xPct }}>
        {[0, 1].map(k => (
          <span key={k} className="marquee-chunk">
            {items.map((m, i) => <span key={i}>{m} <i>✦</i> </span>)}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-band red"><Row base={3} /></div>
      <div className="marquee-band light"><Row base={2.4} reverse /></div>
    </div>
  );
}
