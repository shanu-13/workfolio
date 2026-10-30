"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { projects } from "@/content/site";
import { useMode } from "@/lib/mode";
import { Reveal, RevealTitle, Tilt, Sfx } from "./fx";

export default function Showroom() {
  const { t } = useMode();

  return (
    <section className="section section-light" id="showroom">
      <Sfx text="KA-CHING!" className="sfx-b" tilt={6} />
      <div className="container">
        <RevealTitle key={t(projects.title)} className="section-title" text={t(projects.title)} />
        {t(projects.sub) && <Reveal><p className="section-sub">{t(projects.sub)}</p></Reveal>}

        <div className="showroom-grid">
          {projects.items.map((p, i) => (
            <motion.a
              key={i}
              href={p.href}
              className={`project ${p.tall ? "tall" : ""}`}
              initial={{ opacity: 0, y: 80, clipPath: "inset(30% 10% 30% 10% round 18px)" }}
              whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 18px)" }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.12 }}
            >
              <Tilt className="project-tilt" max={7}>
                <div className="shot" style={{ ["--hue" as string]: p.hue }}>
                  {p.image
                    ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 720px) 100vw, 33vw" />
                    : <span className="shot-label">PROJECT {String(i + 1).padStart(2, "0")}</span>}
                  <span className="shot-cta">View build ↗</span>
                </div>
                <div className="project-meta">
                  <h3>{p.name}</h3>
                  <p>{t(p.line)}</p>
                  <span className="tags">{p.tags}</span>
                </div>
              </Tilt>
            </motion.a>
          ))}
        </div>

        <Reveal className="featured">
          <RevealTitle key={t(projects.featuredTitle)} as="h3" className="featured-title" text={t(projects.featuredTitle)} />
          <ul className="featured-list">
            {projects.featured.map((f, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <motion.a href={f.href} whileHover="hover" initial="rest" animate="rest">
                  <motion.span className="f-bg" variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                  <motion.span className="f-name" variants={{ rest: { x: 0 }, hover: { x: 14 } }}>{f.name}</motion.span>
                  <span className="f-tags">{f.tags.map((tag, j) => <i key={j}>{tag}</i>)}</span>
                  <span className="f-year">{f.year}</span>
                  <motion.span className="f-arrow" variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }}>↗</motion.span>
                </motion.a>
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
