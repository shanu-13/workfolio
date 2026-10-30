"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform,
} from "framer-motion";
import { words } from "./Rich";

const ease = [0.22, 1, 0.36, 1] as const;

/* Headline that rises word by word out of a mask. */
export function RevealTitle({
  text, as = "h2", className, delay = 0, immediate = false,
}: { text: string; as?: "h1" | "h2" | "h3"; className?: string; delay?: number; immediate?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const show = immediate || inView;
  const Tag = motion[as];
  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\*/g, "")} key={text}>
      {words(text).map((w, i) => (
        <Fragment key={i}>
          <span className="word-mask" aria-hidden>
            <motion.span
              className={w.em ? "word em" : "word"}
              initial={{ y: "110%", rotate: 6, opacity: 0 }}
              animate={show ? { y: "0%", rotate: 0, opacity: 1 } : undefined}
              transition={{ duration: 0.9, ease, delay: delay + i * 0.06 }}
            >
              {w.word}
            </motion.span>
          </span>{" "}
        </Fragment>
      ))}
    </Tag>
  );
}

/* Fades/rises into view once. */
export function Reveal({
  children, delay = 0, y = 40, className, as = "div",
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "p" | "article" | "li" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease, delay }}
    >
      {children}
    </Tag>
  );
}

/* Pulls toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-block" }}
      onPointerMove={e => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/* 3D tilt toward the cursor, with a moving glare. */
export function Tilt({ children, className, max = 10 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const glare = useTransform([px, py], ([a, b]: number[]) =>
    `radial-gradient(circle at ${a * 100}% ${b * 100}%, rgba(255,255,255,.25), transparent 55%)`);
  return (
    <motion.div
      className={className}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={e => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
    >
      {children}
      {!reduce && <motion.span className="glare" style={{ background: glare }} aria-hidden />}
    </motion.div>
  );
}

/* Counts up from 0 when scrolled into view. */
export function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease, onUpdate: v => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return <span ref={ref}>{val}</span>;
}

/* Comic sound-effect sticker that pops in and drifts at its own parallax speed. */
export function Sfx({ text, className = "", speed = 140, tilt = -8 }: { text: string; className?: string; speed?: number; tilt?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const rotate = useTransform(scrollYProgress, [0, 1], [tilt - 12, tilt + 12]);
  return (
    <motion.div ref={ref} className={`sfx ${className}`} style={{ y, rotate }} aria-hidden>
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ type: "spring", stiffness: 420, damping: 12 }}
      >
        {text}
      </motion.span>
    </motion.div>
  );
}
