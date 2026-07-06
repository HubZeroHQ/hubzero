'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { year: '2024', label: 'Founded' },
  { year: '2025', label: 'Growing' },
  { year: 'Today', label: 'Building HubZero v2', active: true },
  { year: 'Soon', label: 'Launch' },
];

export default function Timeline() {
  return (
    <section
      className="relative bg-[var(--bg)] px-6 py-24 text-[var(--text)] sm:py-32"
      aria-labelledby="timeline-heading"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="timeline-heading"
          className="font-mono text-xs tracking-[0.25em] text-[var(--text-muted)]"
        >
          WHERE WE ARE
        </h2>

        <div className="relative mt-12">
          {/* Base trace line */}
          <div
            className="absolute left-[9px] top-0 h-full w-px sm:left-0 sm:top-[9px] sm:h-px sm:w-full"
            style={{ backgroundColor: 'var(--border-muted)' }}
          />
          {/* Progress trace, drawn up to "Today" */}
          <motion.div
            initial={{ scaleX: 0, scaleY: 0 }}
            whileInView={{ scaleX: 1, scaleY: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            className="absolute left-[9px] top-0 h-2/3 w-px origin-top sm:left-0 sm:top-[9px] sm:h-px sm:w-2/3 sm:origin-left"
            style={{ backgroundColor: 'var(--accent)' }}
          />

          <ol className="relative flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-4">
            {STEPS.map((step) => (
              <li
                key={step.year}
                className="relative flex items-center gap-4 pl-8 sm:flex-col sm:items-start sm:gap-0 sm:pl-0"
              >
                <span
                  className="absolute left-0 top-0.5 flex h-[19px] w-[19px] items-center justify-center sm:static sm:mb-4"
                  aria-hidden="true"
                >
                  {step.active && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                  )}
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full border-2"
                    style={{
                      backgroundColor: step.active ? 'var(--accent)' : 'var(--bg)',
                      borderColor: step.active ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                </span>

                <div>
                  <div className="font-mono text-sm tracking-wide text-[var(--text-muted)]">
                    {step.year}
                  </div>
                  <div
                    className={`text-base sm:mt-1 ${
                      step.active ? 'font-semibold text-[var(--text)]' : 'text-[var(--text)]'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
