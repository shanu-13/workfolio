"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { nav } from "@/content/site";
import { useMode } from "@/lib/mode";
import { telemetry } from "@/lib/telemetry";

/* Race-track progress bar with a kart riding along it. */
export function ScrollTrack() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const left = useTransform(p, v => `calc(${v * 100}% - ${v * 24}px)`);
  return (
    <div className="track-progress" aria-hidden>
      <motion.div className="track-fill" style={{ scaleX: p }} />
      <motion.span className="kart" style={{ left }}>🏎️</motion.span>
    </div>
  );
}

/* LAP n/7 badge that flips when the section changes. */
export function LapCounter() {
  const { mode } = useMode();
  const [lap, setLap] = useState(1);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setLap(nav.findIndex(n => n.id === e.target.id) + 1);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    nav.forEach(n => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  if (mode !== "race") return null;
  return (
    <div className="lap-counter" aria-hidden>
      LAP{" "}
      <span className="lap-num">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.b key={lap} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}>
            {lap}
          </motion.b>
        </AnimatePresence>
      </span>
      /{nav.length}
    </div>
  );
}

/* Dot + trailing ring cursor that swells over links. Mouse only. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 180, damping: 20, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 180, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("custom-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY);
      setHover(!!(e.target as Element).closest?.("a, button, [data-cursor]"));
    };
    addEventListener("pointermove", move);
    return () => {
      removeEventListener("pointermove", move);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden />
      <motion.div
        className="cursor-ring"
        style={{ x: rx, y: ry }}
        animate={{ scale: hover ? 2.2 : 1, opacity: hover ? 0.9 : 0.5 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        aria-hidden
      />
    </>
  );
}

/* Comic speedometer fed by the 3D car. Scroll faster, go faster. */
export function Speedo() {
  const { mode } = useMode();
  const [kmh, setKmh] = useState(0);
  useEffect(() => {
    if (mode !== "race") return;
    const id = setInterval(() => setKmh(telemetry.kmh), 120);
    return () => clearInterval(id);
  }, [mode]);
  if (mode !== "race") return null;
  const hot = kmh > 330;
  return (
    <div className={`speedo ${hot ? "hot" : ""}`} aria-hidden>
      <b>{kmh}</b>
      <span>KM/H{hot ? " · DRS!" : ""}</span>
      <i style={{ width: `${Math.min(kmh / 6.5, 100)}%` }} />
    </div>
  );
}
