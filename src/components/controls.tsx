import "./goal.css";
import { Goal } from "../services/beeminder";
import useGoalMutations from "../useGoalMutations";
import { getAutodata } from "../lib/directives";
import cnx from "../cnx";
import { useState } from "preact/hooks";
import "./controls.css";
import { Plus, RefreshCw } from "lucide-preact";

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

function parseValue(value: string): number {
  if (value.includes(":")) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours + minutes / 60;
  }
  return Number(value);
}

export default function Controls({
  g,
  refreshOnly,
}: {
  g: Goal;
  refreshOnly?: boolean;
}) {
  const [value, setValue] = useState<string>("");
  const { addDatapoint, refresh: refreshGoal } = useGoalMutations(g.slug);
  const autodata = getAutodata(g);
  const isLoading = addDatapoint.isLoading || refreshGoal.isLoading || g.queued;
  const isError = addDatapoint.isError || refreshGoal.isError;
  const tooltip = isError
    ? getErrorMessage(addDatapoint.error || refreshGoal.error)
    : autodata
    ? "Refresh"
    : "Add datapoint";

  // These controls live inside the goal card, which is now a link. Suppress both
  // propagation and the anchor's default navigation when interacting with a
  // control, so e.g. hitting refresh doesn't also open the goal page.
  const submit = (e: {
    stopPropagation: () => void;
    preventDefault: () => void;
  }) => {
    e.stopPropagation();
    e.preventDefault();
    const v = parseValue(value);
    if (Number.isFinite(v))
      addDatapoint.mutate(v, { onSuccess: () => setValue("") });
  };

  const refresh = (e: {
    stopPropagation: () => void;
    preventDefault: () => void;
  }) => {
    e.stopPropagation();
    e.preventDefault();
    refreshGoal.mutate(autodata);
  };

  if (refreshOnly && !autodata) return null;

  return (
    <span class="controls">
      {!refreshOnly && (
        <>
          <input
            type={g.hhmmformat ? "text" : "number"}
            placeholder={g.hhmmformat ? "0:00" : undefined}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(e);
            }}
          />
          <button
            class={cnx("icon-button", isLoading && "spin")}
            onClick={submit}
            title={tooltip}
          >
            <Plus />
          </button>
        </>
      )}
      {autodata && (
        <button
          class={cnx("icon-button", isLoading && "spin")}
          onClick={refresh}
          title={tooltip}
        >
          <RefreshCw />
        </button>
      )}
    </span>
  );
}
