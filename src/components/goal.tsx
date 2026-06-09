import { Goal } from "../services/beeminder";
import "./goal.css";
import Controls from "./controls";
import Countdown from "./countdown";
import { getGroup } from "../lib/getGroup";
import ViewLink from "./viewLink";

export default function GoalComponent({ g }: { g: Goal }) {
  // The whole card navigates to the goal, but Controls renders buttons/inputs
  // and interactive elements can't live inside an <a>. So only the slug is a
  // real link; its stretched ::after overlay (see goal.css) makes the rest of
  // the card clickable, while Controls sits above the overlay and stays
  // independently interactive.
  return (
    <div
      class={`goal ${getGroup(g)}`}
      style={{
        "--goal-color": `var(--${g.roadstatuscolor})`,
      }}
    >
      <span class="title">
        <ViewLink
          to="/goal/$slug"
          params={{ slug: g.slug }}
          class="slug goal__link"
        >
          {g.slug}
        </ViewLink>
        <Controls g={g} refreshOnly />
      </span>
      <Countdown g={g} />
      <span class="stakes">${g.pledge}</span>
    </div>
  );
}
