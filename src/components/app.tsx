import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import "./app.css";
import { isAuthenticated } from "../auth";
import Login from "./login";
import queryClient from "../queryClient";
import Footer from "./footer";

// The persistent app shell: the dark frame and footer that wrap every page. The
// active page (dashboard or a single goal) renders into the <Outlet/>.
function Layout() {
  if (!isAuthenticated()) return <Login />;

  return (
    <div class={`app__base app__dark`}>
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
