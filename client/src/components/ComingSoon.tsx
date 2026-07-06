import ComingSoonHero from '@/components/coming-soon/ComingSoonHero';
import WhatsChanging from '@/components/coming-soon/WhatsChanging';
import Timeline from '@/components/coming-soon/Timeline';
import ComingSoonFooter from '@/components/coming-soon/ComingSoonFooter';

export default function ComingSoon() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <ComingSoonHero />
      <WhatsChanging />
      <Timeline />
      <ComingSoonFooter />
    </main>
  );
}
