import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/preact";

// ViewLink needs a router context; the back link's target isn't what we're
// testing here, so stub it to a plain anchor.
vi.mock("./viewLink", () => ({
  default: ({ children }: { children: unknown }) => <a>{children as never}</a>,
}));

import DocsPage from "./docsPage";

describe("DocsPage", () => {
  it("documents the fineprint tags", () => {
    const { container } = render(<DocsPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("How bm works");
    expect(text).toContain("#bmPin");
    expect(text).toContain("#bmAutodata");
  });
});
