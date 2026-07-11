"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import {
  SchematicDiagram,
  type DiagramAnnotation,
  type DiagramConnection,
  type DiagramNode,
} from "@/components/marketing/diagram/schematic-diagram";

let scrollTriggerRegistered = false;

export interface SequencedDiagramProps {
  nodes: DiagramNode[];
  connections: DiagramConnection[];
  viewBox: { width: number; height: number };
  annotations?: DiagramAnnotation[];
  className?: string;
}

/**
 * The Build Sequence signature moment (DESIGN/V3/16_SIGNATURE_MOMENTS.md §2)
 * as a reusable primitive, generic over whatever `nodes`/`connections` a
 * page hands it — wraps `SchematicDiagram` with a GSAP ScrollTrigger scrub
 * that draws connections in build order (each node's `tier`: inputs first,
 * then processing, then outputs), tied directly to scroll position so a
 * reader's own scroll speed controls how much of the system has "arrived,"
 * never auto-playing ahead of them (08_MOTION_SYSTEM.md §3). GSAP owns this
 * because it's scroll-scrubbed choreography spanning the whole diagram, not
 * a two-state UI transition — outside Motion's ownership boundary.
 *
 * Reduced motion branches through `gsap.matchMedia()` exactly as
 * 08_MOTION_SYSTEM.md §6 principle 3 requires: the diagram resolves
 * immediately to the fully-connected, fully-legible static state
 * `SchematicDiagram` already renders by default — zero animation, not a
 * faster version of the same one. Spends the host page's one GSAP slot; use
 * at most once per page (16_SIGNATURE_MOMENTS.md §0).
 */
export function SequencedDiagram({
  nodes,
  connections,
  viewBox,
  annotations,
  className,
}: SequencedDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!scrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      scrollTriggerRegistered = true;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        reduced: "(prefers-reduced-motion: reduce)",
        full: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduced } = context.conditions as { reduced: boolean; full: boolean };
        const paths = Array.from(
          container.querySelectorAll<SVGPathElement>("[data-connection] path"),
        );

        if (reduced) {
          gsap.set(paths, { strokeDashoffset: 0, opacity: 1 });
          return;
        }

        const orderedKeys = [...connections]
          .sort((a, b) => {
            const tierA = nodes.find((node) => node.id === a.from)?.tier ?? 0;
            const tierB = nodes.find((node) => node.id === b.from)?.tier ?? 0;
            return tierA - tierB;
          })
          .map((connection) => `${connection.from}->${connection.to}`);

        const orderedPaths = orderedKeys
          .map((key) => container.querySelector<SVGPathElement>(`[data-connection="${key}"] path`))
          .filter((el): el is SVGPathElement => Boolean(el));

        gsap.set(orderedPaths, { strokeDashoffset: 1, opacity: 0 });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 75%",
            end: "bottom 40%",
            scrub: 0.4,
          },
        });

        orderedPaths.forEach((path, index) => {
          timeline.to(
            path,
            { strokeDashoffset: 0, opacity: 1, duration: 1, ease: "none" },
            index * 0.6,
          );
        });

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      },
    );

    return () => mm.revert();
  }, [connections, nodes]);

  return (
    <div ref={containerRef} className={className}>
      <SchematicDiagram
        nodes={nodes}
        connections={connections}
        viewBox={viewBox}
        annotations={annotations}
      />
    </div>
  );
}
