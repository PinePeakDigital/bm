import { useState } from "preact/hooks";
import useGoals from "../useGoals";
import { Goals } from "./goals";
import Header from "./header";
import Center from "./center";

// The dashboard page: the search/filter header plus the grid of goals. Filter
// state lives here because it's meaningful only on this page; the grid hands it
// to goalRoster, which owns the filter → group → order pipeline.
export default function Dashboard() {
  const [filter, setFilter] = useState("");
  const { data } = useGoals();

  if (data === undefined) return <Center>Loading...</Center>;

  return (
    <>
      <Header search={filter} setSearch={setFilter} />
      <div class="app__content">
        <Goals goals={data} filter={filter} />
      </div>
    </>
  );
}
