import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/preact";

// ViewLink needs a router context (useNavigate); stub it to a plain anchor that
// still forwards onClick so we can assert the drawer closes after navigation.
vi.mock("./viewLink", () => ({
  default: ({ children, onClick }: { children: unknown; onClick?: () => void }) => (
    <a onClick={onClick}>{children as never}</a>
  ),
}));

const { logoutSpy } = vi.hoisted(() => ({ logoutSpy: vi.fn() }));
vi.mock("../auth", () => ({ logout: logoutSpy }));

import NavDrawer from "./navDrawer";

describe("NavDrawer", () => {
  beforeEach(() => logoutSpy.mockReset());
  // Renders mount into document.body; without this each test's drawer would
  // accumulate and the scoped queries would match multiple triggers.
  afterEach(cleanup);

  it("hides the panel until the trigger is clicked", () => {
    const { queryByText, getByLabelText } = render(<NavDrawer />);
    expect(queryByText("Add goal")).toBeNull();

    fireEvent.click(getByLabelText("Menu"));
    expect(queryByText("Add goal")).not.toBeNull();
    expect(queryByText("How bm works")).not.toBeNull();
    expect(queryByText("Log out")).not.toBeNull();
  });

  it("closes when the close button is clicked", () => {
    const { queryByText, getByLabelText } = render(<NavDrawer />);
    fireEvent.click(getByLabelText("Menu"));
    fireEvent.click(getByLabelText("Close menu"));
    expect(queryByText("Add goal")).toBeNull();
  });

  it("closes on Escape", () => {
    const { queryByText, getByLabelText } = render(<NavDrawer />);
    fireEvent.click(getByLabelText("Menu"));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByText("Add goal")).toBeNull();
  });

  it("closes when the overlay is clicked", () => {
    const { container, queryByText, getByLabelText } = render(<NavDrawer />);
    fireEvent.click(getByLabelText("Menu"));
    fireEvent.click(container.querySelector(".navDrawer__overlay") as HTMLElement);
    expect(queryByText("Add goal")).toBeNull();
  });

  it("runs an action and closes when its row is activated", () => {
    const { queryByText, getByText, getByLabelText } = render(<NavDrawer />);
    fireEvent.click(getByLabelText("Menu"));
    fireEvent.click(getByText("Log out"));
    expect(logoutSpy).toHaveBeenCalledTimes(1);
    expect(queryByText("Add goal")).toBeNull();
  });
});
