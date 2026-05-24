import { describe, it, expect } from "vitest";
import { render } from "@testing-library/preact";
import Countdown from "./countdown";
import { Goal } from "../services/beeminder";

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    baremin: "1",
    losedate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3,
    won: false,
    ...overrides,
  } as Goal;
}

describe("Countdown", () => {
  it("shows a checkered flag when the goal is won", () => {
    const { container } = render(<Countdown g={makeGoal({ won: true })} />);

    expect(container.querySelector(".lucide-flag")).toBeInTheDocument();
    expect(container.querySelector(".lucide-skull")).not.toBeInTheDocument();
  });

  it("shows the flag for a won goal even if its losedate has passed", () => {
    const losedate = Math.floor(Date.now() / 1000) - 60;

    const { container } = render(
      <Countdown g={makeGoal({ won: true, losedate })} />
    );

    expect(container.querySelector(".lucide-flag")).toBeInTheDocument();
    expect(container.querySelector(".lucide-skull")).not.toBeInTheDocument();
  });

  it("shows a skull when a goal has derailed (losedate passed, not won)", () => {
    const losedate = Math.floor(Date.now() / 1000) - 60;

    const { container } = render(
      <Countdown g={makeGoal({ won: false, losedate })} />
    );

    expect(container.querySelector(".lucide-skull")).toBeInTheDocument();
    expect(container.querySelector(".lucide-flag")).not.toBeInTheDocument();
  });

  it("shows an hourglass when the goal is due within a second", () => {
    const losedate = Date.now() / 1000 + 0.5;

    const { container } = render(
      <Countdown g={makeGoal({ won: false, losedate })} />
    );

    expect(container.querySelector(".lucide-hourglass")).toBeInTheDocument();
    expect(container.querySelector(".lucide-skull")).not.toBeInTheDocument();
  });

  it("shows the remaining time for an active goal", () => {
    // 2.5 days out so Math.floor lands on 2d regardless of sub-second drift.
    const losedate = Math.floor(Date.now() / 1000) + 60 * 60 * 60;

    const { container } = render(
      <Countdown g={makeGoal({ losedate, baremin: "1" })} />
    );

    expect(container.querySelector(".lucide-flag")).not.toBeInTheDocument();
    expect(container.querySelector(".lucide-skull")).not.toBeInTheDocument();
    expect(container.textContent).toContain("1 in 2d");
  });
});
