"use client";

import { motion } from "framer-motion";
import { podium } from "@/content/site";
import { useMode } from "@/lib/mode";
import { Reveal, RevealTitle, Sfx } from "./fx";
import { rich } from "./Rich";

export default function Podium() {
  const { t } = useMode();

  return (
    <section className="section" id="podium">
      <Sfx text="POP!" className="sfx-a" tilt={-12} />
      <div className="container">
        <RevealTitle key={t(podium.title)} className="section-title" text={t(podium.title)} />
        {t(podium.sub) && <Reveal><p className="section-sub">{t(podium.sub)}</p></Reveal>}

        <div className="trophy-grid">
          {podium.items.map((item, i) => (
            <motion.article
              key={i}
              className={`trophy ${item.gold ? "gold" : ""}`}
              initial={{ opacity: 0, y: 140, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ type: "spring", stiffness: 110, damping: 14, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <motion.p
                className="trophy-icon"
                whileHover={{ rotate: [0, -15, 15, -10, 0], scale: 1.3 }}
                transition={{ duration: 0.6 }}
              >
                {item.icon}
              </motion.p>
              <h3>{t(item.name)}</h3>
              <p className="trophy-what">{item.what}</p>
              {t(item.note) && <p className="trophy-note">{rich(t(item.note))}</p>}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
