import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";

/**
 * The thesis section (`CREATIVE_DIRECTION.md` §13.1, §9). The full spec
 * there — The Assembly, two real artifacts (Labs hardware photography and a
 * product interface) disassembling and reassembling in one frame — is a
 * real, named dependency on Labs shipping its first photographed hardware
 * entry (§14 priority 3's own note). No such photograph exists in this
 * repository yet (`public/`, `assets/` — grep-checked), and inventing one
 * would violate the zero-fabrication standard this whole system is built
 * on. Rather than ship a fake "real artifact," or a placeholder graphic
 * `.hubzero/polish/PRODUCT_POLISH.md` already forbids, this is the honest
 * interim version: the same claim, carried entirely by typography and a
 * link to the one real internal project that actually proves it — HubZero's
 * own IoT Sensor Dashboard, built end to end by the team's electronics
 * lead with no client involved. Replace this with the full Assembly the
 * moment real Labs hardware photography exists; don't decorate around the
 * gap in the meantime.
 */
export function Duality() {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      <Container size="prose">
        <Reveal>
          <p className="text-caption text-text-muted font-mono tracking-widest uppercase">
            Software or hardware
          </p>
          <h2 className="text-h1 text-text mt-6 font-semibold text-balance">
            HubZero doesn&apos;t ask which one it is before it starts solving it.
          </h2>
          <p className="text-body text-text-muted mx-auto mt-6 max-w-lg text-balance">
            One team takes a problem from &ldquo;we don&apos;t know yet if this is code or
            circuitry&rdquo; all the way through to a shipped, maintained system — the same
            discipline applied to both, under one roof.
          </p>
        </Reveal>
        <Reveal delayMs={150} className="mt-10">
          <Link
            href="/labs/iot-sensor-dashboard"
            className="text-body text-text inline-flex items-center gap-2 font-medium no-underline hover:underline"
          >
            See it built, end to end, in Labs
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
