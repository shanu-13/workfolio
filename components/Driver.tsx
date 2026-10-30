"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { driver, site } from "@/content/site";
import { useMode } from "@/lib/mode";
import { Counter, Reveal, RevealTitle, Tilt, Sfx } from "./fx";
import { rich } from "./Rich";

const pop = { type: "spring", stiffness: 260, damping: 18 } as const;

function Photo({ sizes }: { sizes: string }) {
  return site.photo ? (
    <div className="photo"><Image src={site.photo} alt="Portrait of R.A. Shankari" fill sizes={sizes} /></div>
  ) : (
    <div className="photo photo-placeholder">
      <span>📸</span>
      <p>Photo coming soon<br /><small>public/assets/img/shankari.jpg</small></p>
    </div>
  );
}

/* Race mode: a comic page — trading card, speech bubble, origin-story strip, fact tiles. */
function ComicPage() {
  return (
    <div className="dp">
      <motion.div
        className="dp-card-wrap"
        initial={{ opacity: 0, rotateY: -35, x: -80 }}
        whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ type: "spring", stiffness: 70, damping: 16 }}
        style={{ transformPerspective: 1200 }}
      >
        <Tilt className="dp-card" max={8}>
          <div className="dp-card-head">
            <span>DRIVER CARD</span>
            <b>#60</b>
          </div>
          <div className="dp-photo"><Photo sizes="360px" /></div>
          <div className="dp-name">
            <h3>{site.name}</h3>
            <p>{driver.card.role} · <strong>{driver.card.team}</strong></p>
          </div>
          <ul className="dp-ratings">
            {driver.ratings.map((r, i) => (
              <li key={r.k}>
                <span>{r.k}</span>
                <div className="dp-bar">
                  <motion.i
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: r.v / 100 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 60, damping: 14 }}
                  />
                </div>
                <b><Counter to={r.v} /></b>
              </li>
            ))}
          </ul>
          <div className="dp-card-foot"><span>{driver.card.licence}</span><span className="dp-barcode" aria-hidden /></div>
        </Tilt>
      </motion.div>

      <div className="dp-main">
        <motion.blockquote
          className="dp-bubble"
          initial={{ opacity: 0, scale: 0.6, rotate: -4 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={pop}
        >
          <span className="dp-caption">The driver says:</span>
          <p>{driver.lead.race}</p>
        </motion.blockquote>

        <ol className="dp-strip">
          {driver.story.map((s, i) => (
            <motion.li
              key={s.ep}
              className={`dp-ep tone-${s.tone}`}
              initial={{ opacity: 0, y: 70, rotate: i % 2 ? 6 : -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
              whileHover={{ rotate: 0, y: -6, scale: 1.03 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ ...pop, delay: i * 0.12 }}
            >
              <span className="dp-ep-num">{s.ep}</span>
              <span className="dp-ep-icon" aria-hidden>{s.icon}</span>
              <h4>{s.title}</h4>
              <p>{rich(s.text)}</p>
            </motion.li>
          ))}
        </ol>

        <div className="dp-facts">
          {driver.facts.map((f, i) => (
            <motion.div
              key={f.k}
              className="dp-fact"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...pop, delay: 0.1 + i * 0.08 }}
            >
              <span className="dp-fact-icon" aria-hidden>{f.icon}</span>
              <div><small>{f.k}</small><p>{f.v}</p></div>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.2}><p className="dp-offtrack">{rich(driver.offTrack)}</p></Reveal>
      </div>
    </div>
  );
}

const icons: Record<string, ReactNode> = {
  code: <path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" />,
  users: <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 9v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7" />,
};

/* Recruiter mode: a calm bento grid — profile, summary, what I'm doing now, numbers, strengths. */
function Profile() {
  const p = driver.profile;
  const rise = (i: number) => ({
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-6% 0px" },
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <div className="bento">
      <motion.aside className="bx bx-id" {...rise(0)}>
        <div className="bx-photo"><Photo sizes="380px" /></div>
        <div className="bx-id-body">
          <h3>{site.name}</h3>
          <p className="bx-role">{p.role} at <strong>{p.team}</strong></p>
          <ul className="bx-pills">{p.languages.map(l => <li key={l}>{l}</li>)}</ul>
          <div className="bx-actions">
            <a className="bx-btn primary" href={site.resume} download>Download resume <span aria-hidden>↓</span></a>
            <a className="bx-btn" href={site.links.linkedin} target="_blank" rel="noopener">LinkedIn <span aria-hidden>↗</span></a>
            <a className="bx-btn" href={site.links.github} target="_blank" rel="noopener">GitHub <span aria-hidden>↗</span></a>
          </div>
        </div>
      </motion.aside>

      <motion.div className="bx bx-summary" {...rise(1)}>
        <p className="bx-eyebrow">Profile</p>
        <p className="bx-lead">{driver.lead.recruiter}</p>
        <p className="bx-body">{driver.body[0].recruiter}</p>
      </motion.div>

      <motion.div className="bx bx-now" {...rise(2)}>
        <p className="bx-eyebrow">Currently</p>
        <ul>
          {p.now.map(n => (
            <li key={n.k}>
              <span className="bx-dot" aria-hidden />
              <div>
                <small>{n.k} · {n.when}</small>
                <h4>{n.v}</h4>
                <p>{n.at}</p>
              </div>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div className="bx bx-numbers" {...rise(3)}>
        {p.highlights.map(h => (
          <div key={h.k}><b>{h.v}</b><span>{h.k}</span></div>
        ))}
      </motion.div>

      <div className="bx-strengths">
        {p.strengths.map((s, i) => (
          <motion.div key={s.t} className="bx bx-strength" {...rise(4 + i)}>
            <span className="bx-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[s.icon]}</svg>
            </span>
            <h4>{s.t}</h4>
            <p>{s.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Driver() {
  const { mode, t } = useMode();
  return (
    <section className="section" id="driver">
      <Sfx text="VROOM!" className="sfx-a" />
      <div className="container">
        <RevealTitle key={t(driver.title)} className="section-title" text={t(driver.title)} />
        {mode === "race" ? <ComicPage /> : <Profile />}
      </div>
    </section>
  );
}
