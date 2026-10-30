"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { nav, site } from "@/content/site";
import { useMode } from "@/lib/mode";

export default function Nav() {
  const { mode, toggle, t } = useMode();
  const [active, setActive] = useState("start");
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  // hide while scrolling down, show again on scroll up
  useMotionValueEvent(scrollY, "change", y => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 300 && !open);
  });

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting && setActive(e.target.id));
    }, { rootMargin: "-45% 0px -50% 0px" });
    nav.forEach(n => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.header
      className="nav"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: hidden ? -110 : 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <a href="#start" className="logo">SHANKARI </a>

      <nav className={`nav-links ${open ? "open" : ""}`}>
        {nav.map(n => (
          <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} className={active === n.id ? "active" : ""}>
            {active === n.id && (
              <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
            )}
            <span className="nav-label">{t(n.label)}</span>
          </a>
        ))}
      </nav>

      <div className="nav-actions">
        <button
          className="mode-toggle"
          onClick={toggle}
          aria-pressed={mode === "recruiter"}
          title={mode === "race" ? "Boss is watching? Switch to Recruiter mode." : "Back to the fun version."}
        >
          <span className={`mode-opt ${mode === "race" ? "on" : ""}`}>🏎️<span className="mode-word"> Race</span></span>
          <span className={`mode-opt ${mode === "recruiter" ? "on" : ""}`}>👔<span className="mode-word"> Recruiter</span></span>
          <motion.span
            className="mode-thumb"
            animate={{ x: mode === "race" ? "0%" : "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </button>
        <a className="btn btn-dark resume-btn" href={site.resume} download data-tip="Loads faster than a pit stop.">Resume ↓</a>
        <button className="menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menu" aria-expanded={open}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? "x" : "m"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              {open ? "✕" : "☰"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </motion.header>
  );
}
