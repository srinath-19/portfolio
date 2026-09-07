// Binds the Featured Work orbit to its detail panel. Thin on purpose: it owns
// only the selection, so `app/page.tsx` stays a declarative list of sections
// and `CardOrbit` stays presentational.
"use client";

import { useCallback, useRef, useState } from "react";
import CardOrbit from "@/components/ui/card-orbit";
import ProjectModal from "@/components/ui/project-modal";
import { projectCards, projects } from "@/lib/projects";

interface Selection {
  index: number;
  /** The orbit card's viewport box, and the panel's FLIP origin. */
  rect: DOMRect;
}

const TOTAL = projects.length;

export function ProjectShowcase() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  const select = useCallback((index: number, rect: DOMRect) => {
    setSelection({ index, rect });
  }, []);

  const close = useCallback(() => setSelection(null), []);

  // Paging re-reads the incoming card's box so the panel can fly it home to
  // its own slot. The read is exact because the ring is frozen for as long as
  // the panel is open, and the cards sit in `items` order in the DOM — GSAP
  // moves them with transforms and never reorders them.
  const page = useCallback(
    (step: number) => {
      if (!selection) return;

      const index = (selection.index + step + TOTAL) % TOTAL;
      const card = ringRef.current?.querySelectorAll<HTMLElement>(
        ".card-orbit-card",
      )[index];

      setSelection({ index, rect: card?.getBoundingClientRect() ?? selection.rect });
    },
    [selection],
  );

  const next = useCallback(() => page(1), [page]);
  const prev = useCallback(() => page(-1), [page]);

  return (
    <div ref={ringRef}>
      <CardOrbit
        className="relative z-10"
        items={projectCards}
        cardWidth={160}
        cardHeight={227}
        rotateSpeed={6}
        depthScale={0.75}
        paused={selection !== null}
        onSelect={select}
      />

      <ProjectModal
        project={selection ? projects[selection.index] : null}
        originRect={selection?.rect ?? null}
        index={selection?.index ?? 0}
        total={TOTAL}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </div>
  );
}

export default ProjectShowcase;
