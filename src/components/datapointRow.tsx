import useGoalMutations from "../useGoalMutations";
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
  const { removeDatapoint: del, copyDatapoint: copy } = useGoalMutations(goal);

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
              del.mutate(point.id);
            }
          }}
        >
          <Trash />
        </button>
        <button
          type="button"
          class={cnx("icon-button", copy.isLoading && "spin")}
          onClick={() => copy.mutate(point.value)}
        >
          <Copy />
        </button>
      </td>
    </tr>
  );
}
