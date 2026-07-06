'use client';

import { motion } from 'framer-motion';

const CARDS = [
  {
    label: 'ENGINEERING',
    accent: 'var(--glow-grad-1)',
    title: 'A rebuilt foundation',
    body: 'Faster pages, cleaner architecture, and infrastructure built to scale with the work — not just patched to keep up.',
  },
  {
    label: 'STUDIO',
    accent: 'var(--glow-grad-3)',
    title: 'A sharper showcase',
    body: 'Case studies and project pages that actually show how we build, not just what we shipped.',
  },
  {
    label: 'COMMUNITY',
    accent: 'var(--glow-grad-2)',
    title: 'A clearer front door',
    body: 'Simpler paths to reach the team, follow along, and start a project with HubZero.',
  },
];

export default function WhatsChanging() {
  return (
    <section
      className="relative bg-[var(--bg)] px-6 py-24 text-[var(--text)] sm:py-32"
      aria-labelledby="whats-changing-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="whats-changing-heading"
          className="font-mono text-xs tracking-[0.25em] text-[var(--text-muted)]"
        >
          WHAT&apos;S CHANGING
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: 'easeOut' }}
              className="group relative border border-[var(--border-muted)] p-6"
            >
              {/* Corner brackets, drafting-table style */}
              <span
                className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 transition-colors"
                style={{ borderColor: card.accent }}
              />
              <span
                className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 transition-colors"
                style={{ borderColor: card.accent }}
              />

              <span
                className="font-mono text-[11px] tracking-[0.2em]"
                style={{ color: card.accent }}
              >
                {card.label}
              </span>
              <h3 className="mt-4 text-xl font-bold">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
