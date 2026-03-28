import { USERNAME, API_KEY } from "../auth";
import { Goal } from "../services/beeminder";
import { beeminderAuthUrl } from "../lib/beeminderAuthUrl";
import groupGoals from "../lib/groupGoals";
import useGoals from "../useGoals";
import Controls from "./controls";
import DatapointRow from "./datapointRow";
import "./detail.css";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import convertDeadlineToTime from "../services/beeminder/convertDeadlineToTime";
import { ArrowLeft, ArrowRight } from "lucide-preact";

function parseFineprint(fineprint: string): string {
  if (!fineprint) return "[empty]";
  const html = marked.parse(fineprint);
  return DOMPurify.sanitize(html);
}

function sigfigs(n: number) {
  const digits = 2;
  const isNegative = n < 0;
  const abs = Math.abs(n);
  const rounded = Math.round(abs * 10 ** digits) / 10 ** digits;
  return isNegative ? -rounded : rounded;
}

export default function Detail({
  g,
  goPrev,
  goNext,
}: {
  g: Goal;
  goNext?: VoidFunction;
  goPrev?: VoidFunction;
}) {
  const { data = [] } = useGoals();
  const grouped = groupGoals(data);
  const goals = Object.values(grouped).flat();
  const i = goals.findIndex((g2) => g2.slug === g.slug);
  const p = i === undefined ? "?" : i + 1;
  const r = sigfigs(g.mathishard[2]);

  console.log({ g });

  return (
    <div
      class="detail"
      style={{
        "--border-color": `var(--${g.roadstatuscolor})`,
      }}
    >
      <div class={`detail__limsumdate ${g.roadstatuscolor}`}>
        <button
          onClick={() => goPrev?.()}
          className={`icon-button ${(!goPrev && "detail__disabled") || ""}`}
        >
          <ArrowLeft />
        </button>
        <span>{g.limsumdate}</span>
        <span>
          {p} of {goals.length}
        </span>
        <button
          onClick={() => goNext?.()}
          className={`icon-button ${(!goNext && "detail__disabled") || ""}`}
        >
          <ArrowRight />
        </button>
      </div>

      <div class="detail__header">
        <div>
          <a
            href={`https://beeminder.com/${USERNAME}/${g.slug}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = beeminderAuthUrl(USERNAME, API_KEY, `https://beeminder.com/${USERNAME}/${g.slug}`);
            }}
            class="detail__headerText"
          >
            <h1>{g.slug}</h1>
          </a>
          <Controls g={g} />
        </div>

        <div class="detail__title">{g.title}</div>
      </div>

      <div className="detail_info">
        <img src={g.svg_url} width={230} height={150} />

        <ul class="pills">
          <li>
            {r} {g.gunits} / {g.runits}
          </li>
          <li>{g.aggday}</li>
          <li>deadline: {convertDeadlineToTime(g.deadline)}</li>
          {g.autoratchet && <li>autoratchet: {g.autoratchet}d</li>}
        </ul>

        <h2>Recent Data</h2>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Comment</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {g.recent_data.map((point) =>
              DatapointRow({
                goal: g.slug,
                point: {
                  id: point.id.$oid,
                  daystamp: point.daystamp,
                  comment: point.comment,
                  value: point.value,
                },
              })
            )}
          </tbody>
        </table>

        <h2>Fineprint</h2>

        <div
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: parseFineprint(g.fineprint || ""),
          }}
        />
      </div>
    </div>
  );
}
