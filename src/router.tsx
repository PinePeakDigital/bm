import { Router, RootRoute, Route } from "@tanstack/react-router";
import { App } from "./components/app";
import Dashboard from "./components/dashboard";
import GoalPage from "./components/goalPage";

// The app layout (auth gate, dark shell, footer) lives at the root and renders
// an <Outlet/> for whichever page is active.
const rootRoute = new RootRoute({ component: App });

// The dashboard: the grid of goals.
const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

// A single goal as its own page (deep-linkable, shareable, Back-button-aware)
// rather than a modal over the dashboard.
const goalRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "goal/$slug",
  component: GoalPage,
});

const routeTree = rootRoute.addChildren([indexRoute, goalRoute]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
