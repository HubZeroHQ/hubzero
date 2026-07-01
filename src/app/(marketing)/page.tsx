import { CaseStudy } from "@/components/marketing/case-study";
import { CtaClose } from "@/components/marketing/cta-close";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowWeWork } from "@/components/marketing/how-we-work";
import { WhatWeDo } from "@/components/marketing/what-we-do";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeDo />
      <CaseStudy />
      <HowWeWork />
      <CtaClose />
    </>
  );
}
