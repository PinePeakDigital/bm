import { QueryClientProvider } from "@tanstack/react-query";
import { Goal } from "../services/beeminder";
import "./app.css";
import { Goals } from "./goals";
import { useState } from "preact/hooks";
import { isAuthenticated } from "../auth";
import useGoals from "../useGoals";
import Login from "./login";
import queryClient from "../queryClient";
import Footer from "./footer";
import Header from "./header";
import Center from "./center";

function _App() {
  const [filter, setFilter] = useState("");
  const { data } = useGoals();

  if (!isAuthenticated()) return <Login />;
  if (data === undefined) return <Center>Loading...</Center>;

  const r = new RegExp(filter, "i");
  const filtered = data.filter((g: Goal) => {
    if (filter && !r.test(g.slug)) return false;
    return true;
  });

  return (
    <div class={`app__base app__dark`}>
      <div>
        <Header search={filter} setSearch={setFilter} />
      </div>
      <div class="app__content">
        <Goals goals={filtered} />
      </div>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <_App />
    </QueryClientProvider>
  );
}
