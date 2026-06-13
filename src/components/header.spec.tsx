import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/preact";

// Header calls useIsFetching, a react-query hook whose runtime needs the
// preact/compat React alias that isn't wired up under vitest. Stub just that
// hook (keeping the rest of the module, so queryClient.ts still gets a real
// QueryClient on import) rather than standing up a QueryClientProvider.
vi.mock("@tanstack/react-query", async (importActual) => ({
  ...(await importActual<typeof import("@tanstack/react-query")>()),
  useIsFetching: () => 0,
}));

import Header from "./header";

describe("Header filter clear button", () => {
  it("hides the clear button when the filter is empty", () => {
    const { container } = render(<Header search="" setSearch={() => undefined} />);
    expect(container.querySelector(".filter__clear")).toBeNull();
  });

  it("shows the clear button and resets the filter when it has text", () => {
    const setSearch = vi.fn();
    const { container } = render(
      <Header search="weight" setSearch={setSearch} />
    );

    const clear = container.querySelector(".filter__clear");
    expect(clear).not.toBeNull();

    fireEvent.click(clear as Element);
    expect(setSearch).toHaveBeenCalledWith("");
  });
});
