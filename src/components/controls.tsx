import "./goal.css";
import { Goal } from "../services/beeminder";
import useGoalMutations from "../useGoalMutations";
import { getAutodata } from "../lib/directives";
import { isProcessing } from "../lib/goalProcessing";
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
  const isLoading =
    addDatapoint.isLoading || refreshGoal.isLoading || isProcessing(g);
  const isError = addDatapoint.isError || refreshGoal.isError;
  const tooltip = isError
    ? getErrorMessage(addDatapoint.error || refreshGoal.error)
    : autodata
    ? "Refresh"
    : "Add datapoint";

  // The goal card navigates via a stretched-link overlay on the slug (see
  // goal.tsx / goal.css); these controls are a sibling of that link and sit
  // above the overlay (z-index) so they stay independently clickable. We still
  // stop propagation and prevent default defensively so a control interaction
  // is never treated as activating the card link.
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
