import { Goal } from "../services/beeminder";
import { useState, useEffect } from "preact/hooks";
import "./countdown.css";
import { ComponentChildren } from "preact";
import { Flag, Hourglass, Skull } from "lucide-preact";

const Unit: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
  w: 60 * 60 * 24 * 7,
  y: 60 * 60 * 24 * 365,
};

function findUnit(n: number): keyof typeof Unit | undefined {
  return Object.keys(Unit).findLast((u) => n > Unit[u]);
}

function getSeconds(g: Goal): number {
  const now = new Date();
  const then = new Date(g.losedate * 1000);
  const diff = then.getTime() - now.getTime();
  return diff / 1000;
}

function getPrefix(g: Goal): string {
  const s = g.baremin.includes("-") ? "-" : "";
  const t = g.baremin.match(/[1-9]?\d:\d\d/)?.[0];
  const n = g.baremin.match(/(\d+\.?\d?\d?)/)?.[1] || "";
  return `${s}${t || n} in`;
}

function W({ children }: { children: ComponentChildren }) {
  return <span class="countdown">{children}</span>;
}

export default function Countdown({ g }: { g: Goal }) {
  const [seconds, setSeconds] = useState<number>(getSeconds(g));

  useEffect(() => {
    const u = findUnit(seconds);
    const n = u ? seconds % Unit[u] : 1;
    const fn = () => setSeconds(getSeconds(g));
    const t = setTimeout(fn, n * 1000);
    const h = () => !document.hidden && fn();
    document.addEventListener("visibilitychange", h);
    return () => {
      clearTimeout(t);
      document.removeEventListener("visibilitychange", h);
    };
  }, [g, seconds]);

  if (g.won)
    return (
      <W>
        <Flag
          class="countdown-icon"
          size={20}
          role="img"
          aria-label="Goal completed"
        />
      </W>
    );

  if (seconds < 0)
    return (
      <W>
        <Skull
          class="countdown-icon"
          size={20}
          role="img"
          aria-label="Goal derailed"
        />
      </W>
    );

  const u = findUnit(seconds);

  if (!u)
    return (
      <W>
        <Hourglass
          class="countdown-icon"
          size={20}
          role="img"
          aria-label="Due now"
        />
      </W>
    );

  return (
    <W>
      {getPrefix(g)} {Math.floor(+seconds / Unit[u])}
      {u}
    </W>
  );
}
