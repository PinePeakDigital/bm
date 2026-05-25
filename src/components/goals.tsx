import { useState, useMemo, useEffect } from "preact/hooks";
import { Goal } from "../services/beeminder";
import groupGoals from "../lib/groupGoals";
import goalNavigation from "../lib/goalNavigation";
import Detail from "./detail";
import G from "./goal";
import "./goals.css";
import Modal from "./modal";

export function Goals({ goals }: { goals: Goal[] }) {
  const [slug, setSlug] = useState<string>();
  const g = useMemo(() => groupGoals(goals), [goals]);
  const nav = useMemo(() => goalNavigation(goals, slug), [goals, slug]);
  const { prev, next } = nav;
  const goPrev = useMemo(
    () => (prev ? () => setSlug(prev.slug) : undefined),
    [prev]
  );
  const goNext = useMemo(
    () => (next ? () => setSlug(next.slug) : undefined),
    [next]
  );
  const close = () => setSlug(undefined);

  useEffect(() => {
    const fn = (e: { key: string }) => {
      if (e.key === "a") return goPrev?.();
      if (e.key === "d") return goNext?.();
      if (e.key === "Escape") return close();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [goNext, goPrev]);

  return (
    <div class="goals">
      <div class="goals__grid goals__pinned">
        {g.pinned.map((g) => (
          <G key={g.slug} g={g} onClick={() => setSlug(g.slug)} />
        ))}
      </div>
      <div class="goals__grid">
        {[...g.today, ...g.next].map((g) => (
          <G key={g.slug} g={g} onClick={() => setSlug(g.slug)} />
        ))}
      </div>
      <div class="goals__grid">
        {g.later.map((g) => (
          <G key={g.slug} g={g} onClick={() => setSlug(g.slug)} />
        ))}
      </div>
      <Modal open={!!nav.current} onClose={close}>
        {nav.current && (
          <Detail
            g={nav.current}
            goPrev={goPrev}
            goNext={goNext}
            position={nav.index + 1}
            count={nav.count}
          />
        )}
      </Modal>
    </div>
  );
}
