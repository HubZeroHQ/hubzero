'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiGithub, FiMail } from 'react-icons/fi';
import BlueprintBackground from './BlueprintBackground';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export default function ComingSoonHero() {
  return (
    <section
      className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-[var(--bg)] text-[var(--text)]"
      aria-label="HubZero v2 coming soon"
    >
      <BlueprintBackground />

      {/* Minimal wordmark, standing in for the full site nav */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-6 sm:px-10 sm:py-8">
        <div className="relative h-7 w-7">
          <Image
            src="/HubZeroLogoICO.png"
            alt=""
            fill
            sizes="28px"
            className="object-contain"
            priority
          />
        </div>
        <span className="font-mono text-sm font-medium tracking-[0.2em] text-[var(--text-muted)]">
          HUBZERO
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 text-center"
      >
        <motion.span
          variants={item}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-light)]/60 px-4 py-1.5 font-mono text-xs tracking-[0.15em] text-[var(--text-muted)] backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          HUBZERO V2 &middot; LAUNCHING SOON
        </motion.span>

        <motion.h1
          variants={item}
          className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
        >
          We&apos;re rebuilding{' '}
          <span className="bg-gradient-to-r from-[#D2AB67] via-[#5FA4E6] to-[#665DCD] bg-clip-text text-transparent">
            HubZero
          </span>{' '}
          from the ground up.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-xl text-base text-[var(--text-muted)] sm:text-lg"
        >
          The same team, a sharper studio, and a site engineered to match. HubZero
          v2 is in active development — this page holds the fort until it ships.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href="https://github.com/HubZeroHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#665DCD] via-[#5FA4E6] to-[#D2AB67] px-6 py-3 text-base font-semibold text-white transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <FiGithub className="text-lg" aria-hidden="true" />
            View on GitHub
          </a>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-base font-semibold transition hover:bg-[var(--bg-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <FiMail className="text-lg" aria-hidden="true" />
            Get in touch
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="relative z-10 hidden justify-center pb-8 sm:flex">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="h-10 w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent"
        />
      </div>
    </section>
  );
}
