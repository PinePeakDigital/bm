import { getCredentials } from "../auth";
import { Goal } from "../services/beeminder";
import { beeminderAuthUrl } from "../lib/beeminderAuthUrl";
import Controls from "./controls";
import DatapointRow from "./datapointRow";
import "./detail.css";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import convertDeadlineToTime from "../services/beeminder/convertDeadlineToTime";
import sigfigs from "../lib/sigfigs";
import { clockifyLimsum } from "../lib/clocky";
import { ArrowLeft, ArrowRight } from "lucide-preact";
import { ComponentChildren } from "preact";
import { isPlainLeftClick } from "../lib/viewTransition";

// One pager arrow. When there's a neighbouring goal it's a real link to that
// goal's page (so middle-click / open-in-new-tab work); a plain left click is
// upgraded to an in-app, view-transitioned navigation via `onActivate`. With no
// neighbour it renders as a disabled, non-interactive arrow.
function PagerArrow({
  href,
  onActivate,
  label,
  children,
}: {
  href?: string;
  onActivate?: VoidFunction;
  label: string;
  children: ComponentChildren;
}) {
  if (!href || !onActivate) {
    return (
      <span class="icon-button detail__disabled" aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      class="icon-button"
      aria-label={label}
      onClick={(e) => {
        if (!isPlainLeftClick(e)) return;
        e.preventDefault();
        onActivate();
      }}
    >
      {children}
    </a>
  );
}

function parseFineprint(fineprint: string): string {
  if (!fineprint) return "[empty]";
  const html = marked.parse(fineprint);
  return DOMPurify.sanitize(html);
}

export default function Detail({
  g,
  goPrev,
  goNext,
  prevHref,
  nextHref,
  position,
  count,
}: {
  g: Goal;
  // In-app, view-transitioned navigation to the neighbouring goal.
  goNext?: VoidFunction;
  goPrev?: VoidFunction;
  // Resolved hrefs for those same neighbours, so the arrows are real links.
  prevHref?: string;
  nextHref?: string;
  // 1-based position of this goal among all goals, and the total, for the pager.
  position: number;
  count: number;
}) {
  const r = sigfigs(g.mathishard[2]);
  // Only the username is needed here, to build the visible goal-page URL; the
  // auth token stays inside beeminderAuthUrl.
  const { username } = getCredentials();

  return (
    <div
      class="detail"
      style={{
        "--border-color": `var(--${g.roadstatuscolor})`,
      }}
    >
      <div class={`detail__limsumdate ${g.roadstatuscolor}`}>
        <PagerArrow href={prevHref} onActivate={goPrev} label="Previous goal">
          <ArrowLeft />
        </PagerArrow>
        <span>{g.hhmmformat ? clockifyLimsum(g.limsumdate) : g.limsumdate}</span>
        <span>
          {position} of {count}
        </span>
        <PagerArrow href={nextHref} onActivate={goNext} label="Next goal">
          <ArrowRight />
        </PagerArrow>
      </div>

      <div class="detail__header">
        <div>
          <a
            href={`https://beeminder.com/${username}/${g.slug}`}
            onClick={(e) => {
              e.preventDefault();
              const url = beeminderAuthUrl(
                `https://beeminder.com/${username}/${g.slug}`
              );
              if (isPlainLeftClick(e)) {
                window.location.href = url;
              } else {
                window.open(url, "_blank", "noopener,noreferrer");
              }
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
        <div class="detail__graph">
          <img src={g.svg_url} width={230} height={150} />

          <ul class="pills">
            <li>
              {r} {g.gunits} / {g.runits}
            </li>
            <li>{g.aggday}</li>
            <li>deadline: {convertDeadlineToTime(g.deadline)}</li>
            {g.autoratchet && <li>autoratchet: {g.autoratchet}d</li>}
          </ul>
        </div>

        <div class="detail__data">
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
              {g.recent_data.map((point) => (
                <DatapointRow
                  key={point.id}
                  goal={g.slug}
                  hhmmformat={g.hhmmformat}
                  point={{
                    id: point.id,
                    daystamp: point.daystamp,
                    comment: point.comment,
                    value: point.value,
                  }}
                />
              ))}
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
    </div>
  );
}
