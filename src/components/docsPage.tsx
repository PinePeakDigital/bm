import { ArrowLeft } from "lucide-preact";
import ViewLink from "./viewLink";
import "./docsPage.css";

// The in-app user guide. bm's behaviour — how goals get grouped, what the
// keyboard does, and especially the `#bm` fineprint tags — lives in code
// (lib/getGroup.ts, lib/goalKeyAction.ts, lib/directives.ts) and was previously
// undocumented anywhere a user could see it. This page is the canonical
// human-facing reference; keep it in sync with those modules.
export default function DocsPage() {
  return (
    <div class="app__content">
      <div class="docs">
        <ViewLink to="/" class="docs__back icon-button">
          <ArrowLeft /> <span>Dashboard</span>
        </ViewLink>

        <h1>How bm works</h1>
        <p>
          <strong>bm</strong> is a focused dashboard for your{" "}
          <a href="https://www.beeminder.com" target="_blank" rel="noreferrer">
            Beeminder
          </a>{" "}
          goals. It reads your goals through the Beeminder API and reorganises
          them around one question: <em>what needs my attention?</em>
        </p>

        <h2>Goal groups</h2>
        <p>
          Every goal is sorted into one of four groups, shown in this order:
        </p>
        <ul>
          <li>
            <strong>Pinned</strong> — goals you always want on top: Beeminder
            "drinker" goals, or any goal tagged <code>#bmPin</code> (see below).
          </li>
          <li>
            <strong>Today</strong> — goals due today (no safety buffer left).
          </li>
          <li>
            <strong>Next</strong> — goals you haven't entered data for today that
            run out of buffer within a week.
          </li>
          <li>
            <strong>Later</strong> — everything else, with comfortable buffer.
          </li>
        </ul>

        <h2>Keyboard navigation</h2>
        <p>On a goal's detail page:</p>
        <ul>
          <li>
            <kbd>a</kbd> — previous goal
          </li>
          <li>
            <kbd>d</kbd> — next goal
          </li>
          <li>
            <kbd>Esc</kbd> — back to the dashboard
          </li>
        </ul>

        <h2>Fineprint tags</h2>
        <p>
          bm stores its own per-goal settings inside each goal's Beeminder{" "}
          <strong>fineprint</strong> field, encoded as <code>#bm…</code> tokens.
          A token has to stand on its own (start of the fineprint or after a
          space) — <code>foo#bmPin</code> doesn't count. You edit the fineprint
          on the goal's page in Beeminder; bm picks the tags up on its next
          refresh.
        </p>
        <table>
          <thead>
            <tr>
              <th>Tag</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>#bmPin</code>
              </td>
              <td>
                Pins the goal to the <strong>Pinned</strong> group, regardless of
                how much buffer it has.
              </td>
            </tr>
            <tr>
              <td>
                <code>#bmAutodata=&lt;url&gt;</code>
              </td>
              <td>
                Marks the goal as autodata and gives bm a custom URL to open when
                you refresh its data — e.g.{" "}
                <code>#bmAutodata=https://example.com/refresh</code>.
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Beeminder "drinker" goals are treated as pinned automatically, so you
          don't need <code>#bmPin</code> on them.
        </p>

        <h2>Data &amp; refresh</h2>
        <p>
          bm authenticates with your Beeminder username and API token, kept in
          your browser's local storage — nothing is sent anywhere but Beeminder.
          Goals refresh automatically (more often while data is queued), and the
          refresh button in the dashboard header forces an immediate reload.
        </p>
      </div>
    </div>
  );
}
