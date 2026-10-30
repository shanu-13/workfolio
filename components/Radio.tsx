"use client";

import { motion } from "framer-motion";
import { radio, site, footer } from "@/content/site";
import { useMode } from "@/lib/mode";
import { Magnetic, Reveal, RevealTitle, Sfx } from "./fx";

export default function Radio() {
  const { mode, t, toast } = useMode();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      toast(t(radio.copied));
    } catch {
      location.href = `mailto:${site.email}`;
    }
  };

  const links = [
    { label: "GitHub", href: site.links.github, icon: "↗", ext: true },
    { label: "LinkedIn", href: site.links.linkedin, icon: "↗", ext: true },
    { label: "Resume", href: site.resume, icon: "↓", download: true },
    { label: "Email", href: `mailto:${site.email}`, icon: "↗" },
  ];

  return (
    <>
      <section className="section section-radio" id="radio">
        <Sfx text="BZZT!" className="sfx-b" />
        <div className="container radio-grid">
          <div>
            {mode === "race" && (
              <motion.p
                className="label radio-label"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                {radio.label}
              </motion.p>
            )}
            <RevealTitle key={t(radio.title)} className="radio-title" text={t(radio.title)} />
            <Reveal delay={0.3}><p className="radio-sub">{t(radio.sub)}</p></Reveal>
          </div>

          <div>
            <div className="link-grid">
              {links.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, scale: 0.6, rotate: i % 2 ? 8 : -8 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: i * 0.08 }}
                >
                  <Magnetic className="magnet-fill" strength={0.25}>
                    <a
                      href={l.href}
                      {...(l.ext ? { target: "_blank", rel: "noopener" } : {})}
                      {...(l.download ? { download: true } : {})}
                    >
                      {l.label} <span>{l.icon}</span>
                    </a>
                  </Magnetic>
                </motion.div>
              ))}
            </div>
            <p className="email-label">Direct email</p>
            <motion.button className="email-copy" onClick={copy} whileTap={{ scale: 0.96 }}>
              {site.email}
              <small>⧉ Click to copy</small>
            </motion.button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="chequer" aria-hidden />
        <div className="footer-panel">
          <motion.p
            key={t(footer.big)}
            className="footer-big"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {t(footer.big)}
          </motion.p>
          <p className="footer-small">
            Designed &amp; built by R.A. Shankari · © 2026 · <a href="#start">{t(footer.top)}</a>
          </p>
          {mode === "race" && (
            <p className="footer-small credit">
              3D car: “Racing car” by scaranto (CC0) via Poly Pizza. Everything else is drawn in code.
            </p>
          )}
        </div>
      </footer>
    </>
  );
}
