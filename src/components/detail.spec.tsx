import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/preact";

// The Beeminder API returns recent_data[].id as a plain string. Detail used to
// read it as `point.id.$oid`, which was always undefined and made delete hit
// /datapoints/undefined.json (404). This test pins Detail to passing the real
// string id down to DatapointRow.
//
// DatapointRow and Controls are stubbed so the test doesn't need a react-query
// provider (react-query's hooks require the preact/compat React alias, which is
// not wired up under vitest).
const { datapointRowSpy } = vi.hoisted(() => ({
  datapointRowSpy: vi.fn<[unknown], null>(() => null),
}));

vi.mock("./datapointRow", () => ({ default: datapointRowSpy }));
vi.mock("./controls", () => ({ default: () => null }));

import Detail from "./detail";
import { Goal } from "../services/beeminder";

const DATAPOINT_ID = "6a135ad0f0168a8b2d437020";

function makeGoal(recentId: string): Goal {
  return {
    slug: "weight",
    limsumdate: "2026-05-24",
    roadstatuscolor: "green",
    title: "Lose weight",
    gunits: "lbs",
    runits: "day",
    aggday: "last",
    deadline: 0,
    autoratchet: null,
    svg_url: "https://example.com/graph.svg",
    mathishard: [0, 0, 1.5],
    fineprint: "",
    recent_data: [
      {
        canonical: "",
        comment: "test comment",
        created_at: "",
        daystamp: "20260524",
        fulltext: "",
        id: recentId,
        measured_at: "",
        origin: "",
        value: 1,
      },
    ],
  } as Goal;
}

describe("Detail recent data", () => {
  it("passes the datapoint's string id down, not an undefined $oid", () => {
    render(<Detail g={makeGoal(DATAPOINT_ID)} position={1} count={1} />);

    expect(datapointRowSpy).toHaveBeenCalledTimes(1);
    // DatapointRow is rendered as a JSX element, so Preact calls it with
    // (props, context). Assert on the props (first arg); `key` is stripped out.
    expect(datapointRowSpy.mock.calls[0][0]).toEqual({
      goal: "weight",
      point: {
        id: DATAPOINT_ID,
        daystamp: "20260524",
        comment: "test comment",
        value: 1,
      },
    });
  });
});
