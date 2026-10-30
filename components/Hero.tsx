"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion, useScroll, useSpring, useTransform, useVelocity,
} from "framer-motion";
import { hero, site } from "@/content/site";
import { useMode } from "@/lib/mode";
import { RevealTitle, Magnetic } from "./fx";
import { rich } from "./Rich";

function useLightsOut() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ((window as Window & { __lightsOut?: boolean }).__lightsOut) { setReady(true); return; }
    const on = () => setReady(true);
    addEventListener("lightsout", on);
    return () => removeEventListener("lightsout", on);
  }, []);
  return ready;
}

export default function Hero() {
  const { mode, t } = useMode();
  const race = mode === "race";
  const ready = useLightsOut();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  // frame 1 zooms past the camera, frame 2 arrives
  const f1Scale = useTransform(p, [0, 0.45], [1, 1.7]);
  const f1Opacity = useTransform(p, [0, 0.35], [1, 0]);
  const f1Blur = useTransform(p, [0, 0.4], ["blur(0px)", "blur(18px)"]);
  const f2Opacity = useTransform(p, [0.4, 0.7], [0, 1]);
  const f2Scale = useTransform(p, [0.4, 0.75], [0.8, 1]);
  const f2Y = useTransform(p, [0.4, 0.75], [80, 0]);
  const bgX = useTransform(p, [0, 1], ["0%", "-35%"]);
  const bgRotate = useTransform(p, [0, 1], [-8, 4]);
  const hintOpacity = useTransform(p, [0, 0.1], [1, 0]);

  // speed lines lean harder the faster you scroll
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 200, damping: 50 });
  const skew = useTransform(velocity, [-3000, 0, 3000], [25, 0, -25]);

  return (
    <section
      ref={ref}
      id="start"
      className={`hero ${race ? "hero-race" : "hero-plain"}`}
    >
      <div className="hero-sticky">
        {race && <motion.div className="speed-lines" style={{ skewX: skew }} aria-hidden />}
        <motion.div
          key={mode}
          className="hero-bg-num"
          style={race ? { x: bgX, rotate: bgRotate } : undefined}
          initial={{ opacity: 0, x: 200 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          60
        </motion.div>

        <div className="hero-inner">
          <motion.p
            className="label"
            initial={{ opacity: 0, letterSpacing: "0.6em" }}
            animate={ready ? { opacity: 1, letterSpacing: "0.15em" } : undefined}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {hero.label}
          </motion.p>

          <div className="hero-frames">
            {/* keyed by mode so scroll-driven styles don't linger after switching */}
            <motion.div key={mode} style={race ? { scale: f1Scale, opacity: f1Opacity, filter: f1Blur } : undefined} className="frame">
              {ready && <RevealTitle key={t(hero.title)} as="h1" className="hero-title" text={t(hero.title)} immediate delay={0.15} />}
              <motion.p
                key={t(hero.sub)}
                className="hero-sub"
                initial={{ opacity: 0, y: 20 }}
                animate={ready ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                {t(hero.sub)}
              </motion.p>
              <motion.div
                className="hero-ctas"
                initial={{ opacity: 0, y: 20 }}
                animate={ready ? { opacity: 1, y: 0 } : undefined}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <Magnetic><a href="#laps" className="btn btn-red">{t(hero.ctaPrimary)}</a></Magnetic>
                <Magnetic><a href={site.resume} className="btn btn-ghost" download>{t(hero.ctaSecondary)}</a></Magnetic>
              </motion.div>
            </motion.div>

            {race && (
              <motion.h2 className="hero-title frame frame-2" style={{ opacity: f2Opacity, scale: f2Scale, y: f2Y }}>
                {rich(hero.second)}
              </motion.h2>
            )}
          </div>
        </div>

        {race && (
          <motion.p className="scroll-hint" style={{ opacity: hintOpacity }}>
            Scroll to accelerate <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>↓</motion.span>
          </motion.p>
        )}
        <div className="kerb" aria-hidden />
      </div>
    </section>
  );
}
