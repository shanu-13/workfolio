"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { loaderLines } from "@/content/site";

type Phase = "lines" | "lights" | "out" | "done";

export default function Loader() {
  const [phase, setPhase] = useState<Phase>("lines");
  const [line, setLine] = useState(0);
  const [lit, setLit] = useState(0);
  const shake = useAnimationControls();

  useEffect(() => {
    let skip = false;
    try {
      skip = !!sessionStorage.getItem("seenLights")
        || matchMedia("(prefers-reduced-motion: reduce)").matches
        || document.documentElement.dataset.mode === "recruiter"
        || new URLSearchParams(location.search).has("recruiter");
    } catch {}
    if (skip) { setPhase("done"); return; }

    document.body.style.overflow = "hidden";
    const timers: ReturnType<typeof setTimeout>[] = [];
    loaderLines.forEach((_, i) => timers.push(setTimeout(() => setLine(i), i * 420)));
    timers.push(setTimeout(() => setPhase("lights"), 500));

    // hold the lights until the 3D circuit has compiled, so its first heavy frame doesn't stutter them
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      for (let i = 1; i <= 5; i++) timers.push(setTimeout(() => setLit(i), i * 380));
      timers.push(setTimeout(() => setPhase("out"), 5 * 380 + 650));
      timers.push(setTimeout(() => setPhase("done"), 5 * 380 + 1900));
    };
    const ready = () => timers.push(setTimeout(start, 300));
    if ((window as Window & { __sceneReady?: boolean }).__sceneReady) ready();
    addEventListener("sceneready", ready);
    timers.push(setTimeout(start, 6000));
    return () => { timers.forEach(clearTimeout); removeEventListener("sceneready", ready); };
  }, []);

  useEffect(() => {
    if (phase === "out") {
      shake.start({ x: [0, -14, 12, -8, 6, -3, 0], y: [0, 6, -5, 4, -2, 1, 0], transition: { duration: 0.5 } });
    }
    if (phase === "done") {
      document.body.style.overflow = "";
      try { sessionStorage.setItem("seenLights", "1"); } catch {}
      // let the hero start its entrance as the doors open
      (window as Window & { __lightsOut?: boolean }).__lightsOut = true;
      dispatchEvent(new Event("lightsout"));
    }
  }, [phase, shake]);

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div className="loader" key="loader" onClick={() => setPhase("done")} aria-hidden>
          {/* split panels that open like garage doors on exit */}
          <motion.div className="loader-panel top" exit={{ y: "-100%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
          <motion.div className="loader-panel bottom" exit={{ y: "100%" }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />

          <motion.div className="loader-stage" animate={shake} exit={{ opacity: 0, scale: 1.4, filter: "blur(12px)" }} transition={{ duration: 0.5 }}>
            <AnimatePresence mode="wait">
              {phase !== "out" ? (
                <motion.div key="lights" className="loader-lights" exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}>
                  <div className="lights">
                    {[0, 1, 2, 3, 4].map(i => (
                      <motion.span
                        key={i}
                        className="light"
                        initial={{ y: -40, opacity: 0 }}
                        animate={{
                          y: 0, opacity: 1,
                          backgroundColor: lit > i ? "#ff1a0d" : "#2a0000",
                          boxShadow: lit > i ? "0 0 40px 10px rgba(225,6,0,.75)" : "0 0 0 0 rgba(225,6,0,0)",
                          scale: lit > i ? [1.25, 1] : 1,
                        }}
                        transition={{ delay: lit > i ? 0 : 0.05 * i, type: "spring", stiffness: 500, damping: 20 }}
                      />
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={line}
                      className="loader-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loaderLines[line]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.p
                  key="out"
                  className="lights-out"
                  initial={{ scale: 3, opacity: 0, filter: "blur(20px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  LIGHTS OUT.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
          <p className="loader-skip">click to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
