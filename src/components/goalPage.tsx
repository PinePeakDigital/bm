import { useEffect } from "preact/hooks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-preact";
import useGoals from "../useGoals";
import goalNavigation from "../lib/goalNavigation";
import Detail from "./detail";
import Center from "./center";
import { isPlainLeftClick, startViewTransition } from "../lib/viewTransition";
import buildHref from "../lib/buildHref";
import goalKeyAction from "../lib/goalKeyAction";
import "./goalPage.css";

const goalHref = (slug: string) => buildHref("/goal/$slug", { slug });

// A single goal rendered as its own page. Opening, paging (prev/next), and
// closing are all real navigations through the router rather than local state,
// so each goal has a shareable URL and the browser Back button just works.
export default function GoalPage() {
  const { slug } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data } = useGoals();

  const nav = goalNavigation(data ?? [], slug);
  const { prev, next, current } = nav;

  const goTo = (target: string) => {
    startViewTransition(() =>
      // The beta router types `params` as an updater; at runtime it threads a
      // plain object through functionalUpdate, so an object is correct here.
      navigate({
        to: "/goal/$slug",
        params: { slug: target },
      } as unknown as Parameters<typeof navigate>[0])
    );
  };

  // Only offer paging when we're actually on a goal — on the not-found page
  // `current` is undefined but goalNavigation still reports a `next` (the first
  // goal), and we don't want the pager keys jumping off the not-found page.
  const goPrev = current && prev ? () => goTo(prev.slug) : undefined;
  const goNext = current && next ? () => goTo(next.slug) : undefined;

  // Go to the dashboard. This is an explicit "to the dashboard" affordance, not
  // a history pop — the browser's own Back button already handles the history
  // stack, so leaving a goal always returns you to the grid.
  const goToDashboard = () => {
    startViewTransition(() =>
      navigate({ to: "/" } as Parameters<typeof navigate>[0])
    );
  };

  // Keyboard pager carried over from the old modal: a/d page, Escape leaves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (goalKeyAction(e)) {
        case "prev":
          return goPrev?.();
        case "next":
          return goNext?.();
        case "dashboard":
          return goToDashboard();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev?.slug, next?.slug]);

  if (data === undefined) return <Center>Loading...</Center>;

  if (!current) {
    return (
      <Center>
        <p>Goal not found.</p>
        <a href="/">Back to dashboard</a>
      </Center>
    );
  }

  return (
    <div class="app__content">
      <div class="goalPage">
        <a
          href="/"
          class="goalPage__back icon-button"
          onClick={(e) => {
            if (!isPlainLeftClick(e)) return;
            e.preventDefault();
            goToDashboard();
          }}
        >
          <ArrowLeft /> <span>Dashboard</span>
        </a>
        <Detail
          g={current}
          goPrev={goPrev}
          goNext={goNext}
          prevHref={prev && goalHref(prev.slug)}
          nextHref={next && goalHref(next.slug)}
          position={nav.index + 1}
          count={nav.count}
        />
      </div>
    </div>
  );
}
