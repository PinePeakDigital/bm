import "./goal.css";
import { createDatapoint, refreshGraph, Goal } from "../services/beeminder";
import { useMutation } from "@tanstack/react-query";
import queryClient from "../queryClient";
import cnx from "../cnx";
import { useState } from "preact/hooks";
import "./controls.css";
import { Plus, RefreshCw } from "lucide-preact";

async function q(slug: string, mutate: () => Promise<unknown>) {
  const cached = queryClient.getQueryData<Goal[]>(["goals"]);
  if (!cached) return;
  const index = cached.findIndex((x) => x.slug === slug);
  if (index === -1) return;
  cached[index] = {
    ...cached[index],
    queued: true,
  };
  queryClient.setQueryData(["goals"], cached);
  const result = await mutate();
  await queryClient.invalidateQueries(["goals"]);
  return result;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

function getAutodata(g: Goal): boolean | string {
  const match = g.fineprint?.match(/#bmAutodata=(\S+)/);

  return match?.[1] || !!g.autodata;
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
  const c = useMutation(
    (v: number) => q(g.slug, () => createDatapoint(g.slug, v)),
    {
      onSuccess: () => setValue(""),
    }
  );
  const autodata = getAutodata(g);
  const r = useMutation(() =>
    q(g.slug, () =>
      typeof autodata === "string" ? fetch(autodata) : refreshGraph(g.slug)
    )
  );
  const isLoading = c.isLoading || r.isLoading || g.queued;
  const isError = c.isError || r.isError;
  const tooltip = isError
    ? getErrorMessage(c.error || r.error)
    : autodata
    ? "Refresh"
    : "Add datapoint";

  const submit = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const v = parseValue(value);
    if (Number.isFinite(v)) c.mutate(v);
  };

  const refresh = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    r.mutate();
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
