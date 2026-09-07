"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { SkillCluster } from "@/lib/skills";

import { techMarks, type TechKey } from "./tech-icons";

interface SkillClustersProps {
  clusters: SkillCluster[];
  className?: string;
}

/** Normalized placement of one cluster: centre in 0–1 of the field box, radius
 *  in 0–1 of the field's `scale` (see `buildLayout`). */
interface Placement {
  cx: number;
  cy: number;
  r: number;
}

interface PlacedNode {
  key: TechKey;
  name: string;
  /** Offset from the cluster centre, in px. */
  dx: number;
  dy: number;
}

interface PlacedCluster {
  id: string;
  /** Centre of the cluster in field pixels. */
  x: number;
  y: number;
  /** Radius in field pixels — the cluster's hit area and its glow size. */
  r: number;
  nodes: PlacedNode[];
}

interface Layout {
  height: number;
  nodeSize: number;
  clusters: PlacedCluster[];
}

/**
 * The scattered arrangement. Hand-tuned so no two clusters collide at any
 * aspect the wide branch produces; `warnOnLayout` re-checks it at runtime in
 * development, because these are exactly the kind of numbers that rot silently
 * when a cluster gains members.
 *
 * `r` tracks node count — Backend carries 18 marks and Retrieval 3, and letting
 * the radius follow makes that imbalance read as composition rather than as a
 * mistake.
 */
const WIDE: Record<string, Placement> = {
  languages: { cx: 0.145, cy: 0.185, r: 0.118 },
  llm: { cx: 0.47, cy: 0.145, r: 0.118 },
  dl: { cx: 0.8, cy: 0.2, r: 0.113 },
  retrieval: { cx: 0.125, cy: 0.525, r: 0.087 },
  backend: { cx: 0.48, cy: 0.515, r: 0.163 },
  cloud: { cx: 0.85, cy: 0.53, r: 0.123 },
  frontend: { cx: 0.155, cy: 0.84, r: 0.109 },
  data: { cx: 0.47, cy: 0.865, r: 0.109 },
  mlops: { cx: 0.82, cy: 0.85, r: 0.095 },
};

/**
 * The one threshold in this file. Everything *within* an arrangement is derived
 * from the measured box the way `card-orbit.tsx` does it — but a nine-cluster
 * scatter genuinely cannot survive a 380px column, so the arrangement itself
 * has to switch somewhere. It is measured off the element rather than a
 * viewport media query, so the field responds to its container.
 */
const WIDE_MIN_WIDTH = 760;

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Fraction of the radius left empty at the centre — this is the hole the
 * category label sits in, so it is sized by the label, not by taste. Every
 * radius in `WIDE` was raised to pay for it: widening the hole shrinks the
 * annulus, which pushes `minRadius` up for the same number of marks.
 */
const CORE_HOLE = 0.5;

/**
 * Smallest radius that fits `n` marks of `node` px without crowding.
 *
 * Phyllotaxis spreads marks evenly, so their nearest-neighbour spacing is
 * roughly `sqrt(area / n)`; requiring that to stay above the mark size gives
 * `r >= node * sqrt(n / annulus)`. The 1.5 is headroom — at exactly 1.0 the
 * marks tile edge to edge with no air between them.
 */
function minRadius(n: number, node: number): number {
  const annulus = Math.PI * (1 - CORE_HOLE * CORE_HOLE);
  return node * Math.sqrt((1.5 * n) / annulus);
}

/** FNV-1a → 0–1. Deterministic, so drift is identical on server and client. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

const clamp = (lo: number, v: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Places one cluster's marks by phyllotaxis — golden-angle steps with the
 * radius following `sqrt(t)`.
 *
 * Same lesson as card-orbit's arc-length spacing, one dimension up: stepping by
 * equal *angle* piles marks into spokes and leaves the rim bare, while `sqrt`
 * steps cover equal *area*, so eighteen marks spread as evenly as three. The
 * `CORE_HOLE` floor keeps the middle clear for the label.
 */
function placeNodes(cluster: SkillCluster, r: number): PlacedNode[] {
  const n = cluster.nodes.length;
  const seed = hash(cluster.id) * Math.PI * 2;
  return cluster.nodes.map((node, i) => {
    const t = (i + 0.5) / n;
    const radius = r * (CORE_HOLE + (1 - CORE_HOLE) * Math.sqrt(t));
    const theta = i * GOLDEN_ANGLE + seed;
    return {
      key: node.key,
      name: node.name,
      dx: radius * Math.cos(theta),
      dy: radius * Math.sin(theta),
    };
  });
}

function buildLayout(clusters: SkillCluster[], width: number): Layout {
  if (clusters.length === 0) return { height: 0, nodeSize: 0, clusters: [] };

  if (width >= WIDE_MIN_WIDTH) {
    // A shallower field starves the big clusters: Backend carries 18 marks, and
    // at 0.62 its radius came out below `minRadius` at every width, so the marks
    // crowded. The field has to be this tall to hold the scatter.
    const height = clamp(600, width * 0.6, 820);
    // Radii key off the short side, so a very wide viewport stretches the gaps
    // between clusters instead of inflating the clusters themselves.
    const scale = Math.min(width, height);
    const nodeSize = Math.round(clamp(26, width * 0.026, 38));
    return {
      height,
      nodeSize,
      clusters: clusters.map((cluster) => {
        const p = WIDE[cluster.id] ?? { cx: 0.5, cy: 0.5, r: 0.1 };
        const r = p.r * scale;
        return {
          id: cluster.id,
          x: p.cx * width,
          y: p.cy * height,
          r,
          nodes: placeNodes(cluster, r),
        };
      }),
    };
  }

  // Narrow: stack the clusters and let the cumulative radii decide the height.
  // Computing this rather than tabling it means a cluster can gain members
  // without anyone having to retune a second set of coordinates.
  //
  // Radius comes from `minRadius`, NOT from the width. Scaling it with the
  // viewport looks reasonable and is a trap: a 750px-wide window made every
  // cluster enormous and stacked the section out to 5,000px. Sizing each
  // cluster to just fit its own marks holds the stack near 1,800px at any
  // width, and only the mark size tracks the viewport.
  const nodeSize = Math.round(clamp(26, width * 0.085, 34));
  const gap = nodeSize * 0.6;
  const placed: PlacedCluster[] = [];
  let cursor = gap;
  for (const cluster of clusters) {
    // 8% over the crowding minimum. `minRadius` only guarantees the marks miss
    // each other; the centre label needs a little more hole than that, and the
    // small clusters were catching it by a few px without this.
    const r = minRadius(cluster.nodes.length, nodeSize) * 1.08;
    const reach = r + nodeSize / 2;
    cursor += reach;
    placed.push({
      id: cluster.id,
      x: width / 2,
      y: cursor,
      r,
      nodes: placeNodes(cluster, r),
    });
    cursor += reach + gap;
  }
  return { height: cursor, nodeSize, clusters: placed };
}

/**
 * Dev-only guard on the hand-tuned `WIDE` table — both failure modes it has.
 * Neither is visible in a build, only in a browser at one particular width,
 * which is exactly why they get checked here.
 */
function warnOnLayout(layout: Layout, width: number) {
  const { clusters, nodeSize, height } = layout;

  for (let i = 0; i < clusters.length; i += 1) {
    const a = clusters[i];

    // 1. A cluster too small for its own marks — they crowd into each other.
    const need = minRadius(a.nodes.length, nodeSize);
    if (a.r < need) {
      console.warn(
        `[skill-clusters] "${a.id}" is ${Math.round(need - a.r)}px too small for ${a.nodes.length} marks at w=${width} — raise its r in WIDE.`,
      );
    }

    // 2. A cluster hanging off the field.
    const reach = a.r + nodeSize / 2;
    const edge = Math.min(a.x - reach, width - (a.x + reach), a.y - reach, height - (a.y + reach));
    if (edge < 0) {
      console.warn(
        `[skill-clusters] "${a.id}" overruns the field by ${Math.round(-edge)}px at w=${width}.`,
      );
    }

    // 3. Two clusters colliding.
    for (let j = i + 1; j < clusters.length; j += 1) {
      const b = clusters[j];
      const gap = Math.hypot(a.x - b.x, a.y - b.y) - (a.r + b.r + nodeSize);
      if (gap < 0) {
        console.warn(
          `[skill-clusters] "${a.id}" and "${b.id}" overlap by ${Math.round(-gap)}px at w=${width}.`,
        );
      }
    }
  }
}

export default function SkillClusters({ clusters, className }: SkillClustersProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const lastWidth = useRef(0);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    const observer = new ResizeObserver((entries) => {
      // We write `height` ourselves, so only a width change may re-layout —
      // reacting to height would feed our own write straight back in.
      const next = Math.round(entries[0].contentRect.width);
      if (next === lastWidth.current) return;
      lastWidth.current = next;
      setWidth(next);
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(() => buildLayout(clusters, width), [clusters, width]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && width > 0) {
      warnOnLayout(layout, width);
    }
  }, [layout, width]);

  const byId = useMemo(
    () => new Map(clusters.map((cluster) => [cluster.id, cluster])),
    [clusters],
  );

  // Hover and focus feed the same state, so touch and keyboard behave the way
  // the pointer does — a bare `:hover` rule would leave both out.
  const activate = useCallback((id: string) => setActive(id), []);
  const clear = useCallback((id: string) => {
    setActive((current) => (current === id ? null : current));
  }, []);

  const readout = active ? byId.get(active) : undefined;
  const totalMarks = clusters.reduce((sum, c) => sum + c.nodes.length, 0);

  return (
    <div className={cn("skill-field-wrap", className)}>
      <div
        ref={fieldRef}
        className="skill-field"
        data-dimmed={active ? "" : undefined}
        // Before the observer fires, width is 0 and every cluster lands on
        // x = 0. The markup still renders — the hidden name lists are the
        // section's real content and belong in the server HTML — but the field
        // stays transparent until it has been measured, so that pile-up is
        // never painted.
        data-ready={width ? "" : undefined}
        style={width ? { height: layout.height } : undefined}
      >
        {layout.clusters.map((placed) => {
          const cluster = byId.get(placed.id);
          if (!cluster) return null;
          const isActive = active === placed.id;
          return (
            <div
              key={placed.id}
              className="skill-cluster"
              data-active={isActive ? "" : undefined}
              role="group"
              aria-label={cluster.label}
              tabIndex={0}
              onMouseEnter={() => activate(placed.id)}
              onMouseLeave={() => clear(placed.id)}
              onFocus={() => activate(placed.id)}
              onBlur={() => clear(placed.id)}
              style={{
                left: placed.x,
                top: placed.y,
                width: placed.r * 2,
                height: placed.r * 2,
                ["--cluster-accent" as string]: cluster.accent,
                // Marks are centred on the rim, so they overhang the cluster
                // box by half their size. The label clears that, not the box.
                ["--node-half" as string]: `${layout.nodeSize / 2}px`,
                // Genuinely clear width at the centre, which is the hole minus
                // the half-mark the innermost ring reaches back in by — not
                // `CORE_HOLE * 2r`, which is the hole measured to the mark
                // *centres* and overstates the room by half a mark each side.
                // The label sizes its own text off this.
                ["--core-d" as string]: `${Math.max(
                  32,
                  Math.round(2 * (placed.r * CORE_HOLE - layout.nodeSize / 2)),
                )}px`,
              }}
            >
              <span aria-hidden className="skill-cluster-core" />
              <span aria-hidden className="skill-cluster-label">
                {cluster.short}
              </span>

              {/* The marks are decorative, so the names live here for screen
                  readers. Card-orbit makes every card focusable because its
                  titles hide behind a flip; here they are plain list content,
                  and tabbing through seventy marks would be hostile — the
                  cluster is the focus stop instead. */}
              <ul className="sr-only">
                {cluster.nodes.map((node) => (
                  <li key={`${node.key}-${node.name}`}>{node.name}</li>
                ))}
                {cluster.concepts.map((concept) => (
                  <li key={concept}>{concept}</li>
                ))}
              </ul>

              {placed.nodes.map((node, i) => {
                const mark = techMarks[node.key];
                const Icon = mark.Icon;
                const seed = `${cluster.id}-${node.key}-${i}`;
                return (
                  <span
                    aria-hidden
                    key={seed}
                    className="skill-node"
                    style={{
                      // Rounded, and delivered as custom properties rather than
                      // an inline `calc()` — see the `.skill-node` comment in
                      // globals.css. Raw floats in a calc() hydrate mismatched.
                      width: `${layout.nodeSize}px`,
                      height: `${layout.nodeSize}px`,
                      ["--node-dx" as string]: `${node.dx.toFixed(2)}px`,
                      ["--node-dy" as string]: `${node.dy.toFixed(2)}px`,
                      ["--mark" as string]: mark.color,
                      // Raw offsets. globals.css multiplies them by
                      // `--drift-scale`, which the reduced-motion block turns
                      // down instead of switching the animation off.
                      // Polar, not independent x and y. Hashing the two axes
                      // separately looks equivalent and is not: both land near
                      // zero often enough that 6 of 73 marks drifted under 4px
                      // and one moved 0.8px, sitting dead beside a neighbour
                      // travelling 17px. Picking a direction and a *bounded*
                      // length instead gives every mark the same amount of
                      // travel and varies only the heading.
                      ["--drift-dx" as string]: `${(
                        Math.cos(hash(seed) * Math.PI * 2) *
                        (9 + hash(`${seed}r`) * 7)
                      ).toFixed(2)}px`,
                      ["--drift-dy" as string]: `${(
                        Math.sin(hash(seed) * Math.PI * 2) *
                        (9 + hash(`${seed}r`) * 7)
                      ).toFixed(2)}px`,
                      ["--drift-dur" as string]: `${(4 + hash(`${seed}d`) * 3.5).toFixed(2)}s`,
                      ["--drift-delay" as string]: `${(hash(`${seed}p`) * -8).toFixed(2)}s`,
                    }}
                  >
                    <span className="skill-node-glyph">
                      <Icon />
                    </span>
                    <span className="skill-node-label">{node.name}</span>
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Concepts read out here rather than in the field. Roughly a hundred of
          them have no mark, and scattering that much type between the clusters
          would collide with everything. */}
      <div className="skill-readout glass-panel glass-quiet" aria-live="polite">
        {readout ? (
          <>
            <p className="skill-readout-label" style={{ color: readout.accent }}>
              {readout.label}
            </p>
            <p className="skill-readout-body">{readout.concepts.join(" · ")}</p>
          </>
        ) : (
          <>
            <p className="skill-readout-label">{clusters.length} clusters</p>
            <p className="skill-readout-body">
              {totalMarks} tools across the stack — hover a cluster for the
              techniques behind it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
