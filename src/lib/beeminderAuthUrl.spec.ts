import { describe, it, expect } from "vitest";
import { beeminderAuthUrl } from "./beeminderAuthUrl";

describe("beeminderAuthUrl", () => {
  it("constructs an auth redirect URL for a beeminder goal page", () => {
    const url = beeminderAuthUrl(
      "alice",
      "abc123",
      "https://beeminder.com/alice/mygoal"
    );
    expect(url).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=abc123&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Falice%2Fmygoal"
    );
  });

  it("encodes query parameters in the target URL", () => {
    const url = beeminderAuthUrl(
      "alice",
      "abc123",
      "https://beeminder.com/breaks?start=2024-01-01&finish=2024-01-07"
    );
    expect(url).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=abc123&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Fbreaks%3Fstart%3D2024-01-01%26finish%3D2024-01-07"
    );
  });

  it("works for settings pages", () => {
    const url = beeminderAuthUrl(
      "alice",
      "abc123",
      "https://beeminder.com/settings/account"
    );
    expect(url).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=abc123&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Fsettings%2Faccount"
    );
  });

  it("encodes reserved characters in the API key", () => {
    const url = beeminderAuthUrl(
      "alice",
      "key+with=special&chars",
      "https://beeminder.com/alice/mygoal"
    );
    expect(url).toBe(
      "https://www.beeminder.com/api/v1/users/alice.json?auth_token=key%2Bwith%3Dspecial%26chars&redirect_to_url=https%3A%2F%2Fbeeminder.com%2Falice%2Fmygoal"
    );
  });
});
