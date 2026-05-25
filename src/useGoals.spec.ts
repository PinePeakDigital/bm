import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock auth so we can assert logout() without touching localStorage or
// navigating. `vi.hoisted` defines the spy above the hoisted vi.mock factory.
const { logout } = vi.hoisted(() => ({ logout: vi.fn() }));
vi.mock("./auth", () => ({ logout, isAuthenticated: () => true }));

import { handleGoalsError } from "./useGoals";
import { BeeminderApiError } from "./services/beeminder";

describe("handleGoalsError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    // Restore the console.error spy so it can't leak into other test files.
    vi.restoreAllMocks();
  });

  it("logs the user out on a 401 BeeminderApiError", () => {
    handleGoalsError(new BeeminderApiError(401, "Unauthorized"));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });

  it("does not log out on a non-401 BeeminderApiError", () => {
    handleGoalsError(new BeeminderApiError(500, "Internal Server Error"));

    expect(logout).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("does not log out on a non-Beeminder error (e.g. a network failure)", () => {
    handleGoalsError(new TypeError("Failed to fetch"));

    expect(logout).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
