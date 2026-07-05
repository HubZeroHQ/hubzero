import { CircuitConnector } from "@/components/marketing/circuit-motif";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";

const steps = [
  {
    number: "01",
    title: "Discovery",
    body: "A scoped conversation, not a sales pitch. We figure out whether the problem is software, hardware, or both, and what “done” actually looks like — before anything is built.",
  },
  {
    number: "02",
    title: "Build",
    body: "The same people who scoped the project build it — software and hardware engineers working as one team, not handed between departments.",
  },
  {
    number: "03",
    title: "Stay",
    body: "Launch isn’t the finish line. We stay on for fixes, maintenance, and the next iteration — the relationship doesn’t end at delivery.",
  },
];

/**
 * ARCHITECTURE/15_HOMEPAGE_DESIGN.md §9: "compact vertical stepped list,
 * offset right," deliberately the fastest, least lingering beat on the
 * page — a change of tempo right after the case study's slow immersion
 * (§9a). The circuit motif's second and final appearance lives here as
 * the connective line running between the three steps, not a divider.
 *
 * Top padding is intentionally tighter than bottom: the case study already
 * closes on a generous pause (its own pb-44 at lg), so an equally generous
 * pt here stacked two slow pauses back to back and blunted the "confidence
 * returning, briskly" tempo change §9a calls for. Bottom keeps its original
 * size — that gap feeds the CTA close's own arrival and was never the
 * problem.
 */
export function HowWeWork() {
  return (
    <div className="pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-12 lg:pb-24">
      <Container>
        <div className="lg:ml-auto lg:max-w-xl">
          <Reveal>
            <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
              How we work
            </p>
          </Reveal>

          <div className="relative mt-8 pl-12">
            <CircuitConnector className="absolute top-1 left-0 h-[calc(100%-0.5rem)] w-6" />

            <ol className="space-y-10">
              {steps.map((step, i) => (
                <Reveal key={step.number} as="li" delayMs={i * 90}>
                  <p className="text-caption text-text-muted font-mono">{step.number}</p>
                  <h3 className="text-h3 text-text mt-1 font-normal">{step.title}</h3>
                  <p className="text-body text-text-muted mt-2 max-w-md">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </div>
  );
}
