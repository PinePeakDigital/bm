import { useState } from "preact/hooks";
import { Goal } from "../services/beeminder";
import useGoals from "../useGoals";
import { Goals } from "./goals";
import Header from "./header";
import Center from "./center";

// The dashboard page: the search/filter header plus the grid of goals. Filter
// state lives here because it's meaningful only on this page.
export default function Dashboard() {
  const [filter, setFilter] = useState("");
  const { data } = useGoals();

  if (data === undefined) return <Center>Loading...</Center>;

  // The filter doubles as a regex for power users, but a half-typed pattern
  // (e.g. a lone "[") makes the RegExp constructor throw, which would crash the
  // page. Fall back to a plain substring match when the pattern is invalid.
  let r: RegExp | null = null;
  try {
    r = new RegExp(filter, "i");
  } catch {
    r = null;
  }
  const filtered = data.filter((g: Goal) => {
    if (!filter) return true;
    return r
      ? r.test(g.slug)
      : g.slug.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <>
      <Header search={filter} setSearch={setFilter} />
      <div class="app__content">
        <Goals goals={filtered} />
      </div>
    </>
  );
}
