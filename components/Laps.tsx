"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { laps } from "@/content/site";
import { useMode } from "@/lib/mode";
import { Counter, Reveal, RevealTitle, Sfx } from "./fx";
import { rich } from "./Rich";

export default function Laps() {
  const { mode, t } = useMode();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const top = useTransform(p, v => `${v * 100}%`);

  return (
    <section className="section" id="laps">
      <Sfx text="ZOOOM!" className="sfx-a" speed={200} />
      <div className="container">
        <RevealTitle key={t(laps.title)} className="section-title" text={t(laps.title)} />
        {t(laps.sub) && <Reveal><p className="section-sub">{t(laps.sub)}</p></Reveal>}

        <div className="timeline" ref={ref}>
          <div className="timeline-rail" aria-hidden>
            <motion.div className="timeline-fill" style={{ scaleY: p }} />
            {mode === "race" && <motion.span className="timeline-kart" style={{ top }}>🏎️</motion.span>}
          </div>

          {laps.items.map((lap, i) => (
            <motion.article
              key={lap.role}
              className="lap"
              initial={{ opacity: 0, x: 120, skewX: -8 }}
              whileInView={{ opacity: 1, x: 0, skewX: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ type: "spring", stiffness: 80, damping: 16, delay: i * 0.1 }}
            >
              <div className={`lap-flag ${lap.live ? "on-track" : ""}`}>{t(lap.flag)}</div>
              <h3>{lap.role}</h3>
              <p className="lap-date">{lap.date}</p>
              {t(lap.hook) && <p className="lap-hook">{rich(t(lap.hook))}</p>}
              <ul>
                {lap.points[mode].map((pt, j) => (
                  <motion.li
                    key={pt}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + j * 0.08 }}
                  >
                    {pt}
                  </motion.li>
                ))}
              </ul>
              {lap.stats.length > 0 && (
                <div className="lap-stats">
                  {lap.stats.map(s => (
                    <div key={s.suffix}><b><Counter to={s.n} /></b><span>{s.suffix}</span></div>
                  ))}
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
