import { Goal } from "../services/beeminder";
import { useState, useEffect } from "preact/hooks";
import "./countdown.css";
import { ComponentChildren } from "preact";
import { Flag, Hourglass, Skull } from "lucide-preact";
import { Unit, findUnit, secondsUntil, getPrefix } from "../lib/countdown";

function W({ children }: { children: ComponentChildren }) {
  return <span class="countdown">{children}</span>;
}

export default function Countdown({ g }: { g: Goal }) {
  const [seconds, setSeconds] = useState<number>(secondsUntil(g.losedate));

  useEffect(() => {
    const u = findUnit(seconds);
    const n = u ? seconds % Unit[u] : 1;
    const fn = () => setSeconds(secondsUntil(g.losedate));
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
