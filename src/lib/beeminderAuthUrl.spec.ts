import { describe, it, expect, vi, beforeEach } from "vitest";

// beeminderAuthUrl now sources credentials from the session module itself, so
// callers no longer thread username/apiKey in. Mock getCredentials to drive the
// inputs. `vi.hoisted` defines the spy above the hoisted vi.mock factory.
const { getCredentials } = vi.hoisted(() => ({ getCredentials: vi.fn() }));
vi.mock("../auth", () => ({ getCredentials }));

import { beeminderAuthUrl } from "./beeminderAuthUrl";

describe("beeminderAuthUrl", () => {
  beforeEach(() => {
    getCredentials.mockReturnValue({ username: "alice", apiKey: "abc123" });
  });

  it("constructs an auth redirect URL for a beeminder goal page", () => {
    expect(beeminderAuthUrl("https://beeminder.com/alice/mygoal")).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=abc123&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Falice%2Fmygoal"
    );
  });

  it("encodes query parameters in the target URL", () => {
    expect(
      beeminderAuthUrl(
        "https://beeminder.com/breaks?start=2024-01-01&finish=2024-01-07"
      )
    ).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=abc123&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Fbreaks%3Fstart%3D2024-01-01%26finish%3D2024-01-07"
    );
  });

  it("works for settings pages", () => {
    expect(beeminderAuthUrl("https://beeminder.com/settings/account")).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=abc123&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Fsettings%2Faccount"
    );
  });

  it("encodes reserved characters in the API key sourced from the session", () => {
    getCredentials.mockReturnValue({
      username: "alice",
      apiKey: "key+with=special&chars",
    });

    expect(beeminderAuthUrl("https://beeminder.com/alice/mygoal")).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=key%2Bwith%3Dspecial%26chars&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Falice%2Fmygoal"
    );
  });

  it("sources credentials from the session module rather than taking them as arguments", () => {
    beeminderAuthUrl("https://beeminder.com/new");

    expect(getCredentials).toHaveBeenCalled();
  });
});
