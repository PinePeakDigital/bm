import { useState } from "preact/hooks";
import useGoals from "../useGoals";
import filterGoals from "../lib/filterGoals";
import { Goals } from "./goals";
import Header from "./header";
import Center from "./center";

// The dashboard page: the search/filter header plus the grid of goals. Filter
// state lives here because it's meaningful only on this page.
export default function Dashboard() {
  const [filter, setFilter] = useState("");
  const { data } = useGoals();

  if (data === undefined) return <Center>Loading...</Center>;

  const filtered = filterGoals(data, filter);

  return (
    <>
      <Header search={filter} setSearch={setFilter} />
      <div class="app__content">
        <Goals goals={filtered} />
      </div>
    </>
  );
}
