import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import "./app.css";
import { isAuthenticated } from "../auth";
import Login from "./login";
import queryClient from "../queryClient";
import Footer from "./footer";
import NavDrawer from "./navDrawer";

// The persistent app shell: the dark frame, global nav drawer, and footer that
// wrap every page. The active page (dashboard, a single goal, or the docs page)
// renders into the <Outlet/>.
function Layout() {
  if (!isAuthenticated()) return <Login />;

  return (
    <div class={`app__base app__dark`}>
      <NavDrawer />
      <Outlet />
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout />
    </QueryClientProvider>
  );
}
