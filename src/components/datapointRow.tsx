import { useMutation } from "@tanstack/react-query";
import { createDatapoint, deleteDatapoint } from "../services/beeminder";
import queryClient from "../queryClient";
import cnx from "../cnx";
import "./datapointRow.css";
import { Copy, Trash } from "lucide-preact";

export default function DatapointRow({
  goal,
  point,
}: {
  goal: string;
  point: {
    id: string;
    daystamp: string;
    comment: string;
    value: number;
  };
}) {
  const del = useMutation(() => deleteDatapoint(goal, point.id), {
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });
  const copy = useMutation(() => createDatapoint(goal, point.value), {
    onSuccess: () => queryClient.invalidateQueries(["goals"]),
  });

  return (
    <tr key={point.id} data-id={point.id} class="datapoint-row">
      <td>{point.daystamp}</td>
      <td>{point.comment}</td>
      <td>{point.value}</td>
      <td>
        <button
          type="button"
          class={cnx("icon-button", del.isLoading && "spin")}
          onClick={() => {
            if (confirm("Are you sure you want to delete this datapoint?")) {
              del.mutate();
            }
          }}
        >
          <Trash />
        </button>
        <button
          type="button"
          class={cnx("icon-button", copy.isLoading && "spin")}
          onClick={() => copy.mutate()}
        >
          <Copy />
        </button>
      </td>
    </tr>
  );
}
