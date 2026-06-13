import { useIsFetching } from "@tanstack/react-query";
import queryClient from "../queryClient";
import "./header.css";
import { RefreshCw, Search, X } from "lucide-preact";

// The dashboard's header keeps only the two frequent, dashboard-specific
// controls: the goal filter and a manual refresh. Everything rarer (add goal,
// breaks, account, docs, logout, …) now lives in the global NavDrawer.
export default function Header({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (s: string) => void;
}) {
  const isFetching = useIsFetching();

  return (
    <div class="main-header">
      <div class="global-controls">
        <span class="filter">
          <Search class="filter__icon" />
          <input
            type="text"
            placeholder="filter"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          {search && (
            <button
              class="icon-button filter__clear"
              onClick={() => setSearch("")}
              title="Clear filter"
            >
              <X />
            </button>
          )}
        </span>

        <span class="buttons">
          <button
            class={`icon-button ${isFetching ? "spin" : ""}`}
            title="Refresh"
            onClick={() => void queryClient.refetchQueries()}
          >
            <RefreshCw />
          </button>
        </span>
      </div>
    </div>
  );
}
