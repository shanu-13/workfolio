"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Copy } from "@/content/site";

type Mode = "race" | "recruiter";
type Ctx = {
  mode: Mode;
  toggle: () => void;
  t: (copy: Copy) => string;
  toast: (msg: string) => void;
};

const ModeContext = createContext<Ctx | null>(null);

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside <ModeProvider>");
  return ctx;
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("race");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // restore saved mode, or ?recruiter in the URL
  useEffect(() => {
    let saved: Mode = "race";
    try { saved = (localStorage.getItem("mode") as Mode) || "race"; } catch {}
    if (new URLSearchParams(location.search).has("recruiter")) saved = "recruiter";
    setMode(saved);
    console.log(
      "%c🏎️  Oh, you're inspecting the engine? Respect.\n%cSay hi: shankari9514@gmail.com",
      "font: 600 16px sans-serif; color: #e10600;",
      "font: 13px monospace; color: #888;"
    );
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    try { localStorage.setItem("mode", mode); } catch {}
  }, [mode]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const toggle = useCallback(() => {
    setMode(m => {
      const next = m === "race" ? "recruiter" : "race";
      toast(next === "recruiter" ? "👔 Recruiter mode on. Very professional." : "🏎️ Race mode on. Let's go!");
      return next;
    });
  }, [toast]);

  const t = useCallback((copy: Copy) => copy[mode], [mode]);

  // idle radio check
  useEffect(() => {
    if (mode !== "race") return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => toast("📻 Driver, are you still there?"), 30000);
    };
    const events = ["scroll", "mousemove", "keydown", "touchstart"];
    events.forEach(e => addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach(e => removeEventListener(e, reset));
    };
  }, [mode, toast]);

  return (
    <ModeContext.Provider value={{ mode, toggle, t, toast }}>
      {children}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            key={toastMsg}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </ModeContext.Provider>
  );
}
