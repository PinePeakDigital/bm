import { Goal } from "../services/beeminder";
import "./goal.css";
import Controls from "./controls";
import Countdown from "./countdown";
import { getGroup } from "../lib/getGroup";
import ViewLink from "./viewLink";

export default function GoalComponent({ g }: { g: Goal }) {
  return (
    <ViewLink
      to="/goal/$slug"
      params={{ slug: g.slug }}
      class={`goal ${getGroup(g)}`}
      style={{
        "--goal-color": `var(--${g.roadstatuscolor})`,
      }}
    >
      <span class="title">
        <span className="slug">{g.slug}</span>
        <Controls g={g} refreshOnly />
      </span>
      <Countdown g={g} />
      <span class="stakes">${g.pledge}</span>
    </ViewLink>
  );
}
