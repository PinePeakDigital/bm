import { describe, it, expect, vi, afterEach } from "vitest";
import { getGoals, BeeminderApiError } from "./index";

// api() is private; we drive it through getGoals() and stub fetch. We mock a
// minimal Response-shaped object with just the fields api() reads.
function stubFetch(response: Partial<Response>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response as Response))
  );
}

// Run a request expected to reject and hand back the thrown value as `unknown`
// (getGoals resolves to `any`, so we deliberately avoid leaking that here).
async function rejection(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("expected the request to reject, but it resolved");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("beeminder api error contract", () => {
  it("returns the parsed JSON body on a 2xx response", async () => {
    const goals = [{ slug: "weight" }];
    stubFetch({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve(goals),
      text: () => Promise.resolve(""),
    });

    await expect(getGoals()).resolves.toEqual(goals);
  });

  it("throws a BeeminderApiError carrying the HTTP status on a non-2xx response", async () => {
    stubFetch({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: () => Promise.resolve({}),
      text: () => Promise.resolve("token expired"),
    });

    const error = await rejection(getGoals);

    expect(error).toBeInstanceOf(BeeminderApiError);
    if (!(error instanceof BeeminderApiError)) throw error;
    expect(error.status).toBe(401);
    expect(error.statusText).toBe("Unauthorized");
    expect(error.body).toBe("token expired");
    // A BeeminderApiError is still an Error, so message-based displays keep working.
    expect(error.message).toBe("401 Unauthorized");
  });

  it("leaves body undefined when the error response has an empty body", async () => {
    stubFetch({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
    });

    const error = await rejection(getGoals);

    expect(error).toBeInstanceOf(BeeminderApiError);
    if (!(error instanceof BeeminderApiError)) throw error;
    expect(error.status).toBe(500);
    expect(error.body).toBeUndefined();
  });
});
