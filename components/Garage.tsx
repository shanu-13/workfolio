"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { garage } from "@/content/site";
import { useMode } from "@/lib/mode";
import { Reveal, RevealTitle, Sfx } from "./fx";
import { rich } from "./Rich";

const tilts = [-4, 3, -2, 4];
const drops = [0, 30, -10, 20];

export default function Garage() {
  const { mode, t } = useMode();
  const race = mode === "race";
  const area = useRef<HTMLDivElement>(null);

  return (
    <section className="section section-light" id="garage">
      <Sfx text="CLANK!" className="sfx-b" tilt={7} />
      <div className="container">
        <RevealTitle key={t(garage.title)} className="section-title" text={t(garage.title)} />
        {t(garage.sub) && <Reveal><p className="section-sub">{t(garage.sub)}</p></Reveal>}

        <div className="garage-grid" ref={area}>
          {garage.parts.map((p, i) => (
            <motion.article
              key={i}
              className="part-card"
              data-cursor
              style={{ ["--card" as string]: p.color }}
              initial={{ opacity: 0, y: -260, rotate: tilts[i] * 6 }}
              whileInView={{ opacity: 1, y: race ? drops[i] : 0, rotate: race ? tilts[i] : 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ type: "spring", stiffness: 120, damping: 11, delay: i * 0.12 }}
              drag={race}
              dragConstraints={area}
              dragElastic={0.25}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 5 }}
              whileDrag={{ scale: 1.1, rotate: 0, zIndex: 10, boxShadow: "0 30px 60px rgba(0,0,0,.25)" }}
            >
              {race && <span className="tape" aria-hidden />}
              <div className="part-inner">
                <p className="part-icon">{p.icon}</p>
                <h3>{t(p.name)}</h3>
                <p className="chips">{p.chips}</p>
                {t(p.note) && (
                  i === 3
                    ? <div className="commits">{t(p.note).match(/`[^`]+`/g)?.map(l => <div key={l}>{rich(l)}</div>)}</div>
                    : <p>{rich(t(p.note))}</p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
