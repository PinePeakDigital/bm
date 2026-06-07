import { useEffect } from "preact/hooks";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-preact";
import useGoals from "../useGoals";
import goalNavigation from "../lib/goalNavigation";
import Detail from "./detail";
import Center from "./center";
import {
  hasInternalHistory,
  isPlainLeftClick,
  markInternalNavigation,
  startViewTransition,
} from "../lib/viewTransition";
import buildHref from "../lib/buildHref";
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
    markInternalNavigation();
    startViewTransition(() =>
      // The beta router types `params` as an updater; at runtime it threads a
      // plain object through functionalUpdate, so an object is correct here.
      navigate({
        to: "/goal/$slug",
        params: { slug: target },
      } as unknown as Parameters<typeof navigate>[0])
    );
  };

  const goPrev = prev ? () => goTo(prev.slug) : undefined;
  const goNext = next ? () => goTo(next.slug) : undefined;

  // Back, the SPA-friendly way the post describes: if we got here by navigating
  // within the app, pop history so the previous view returns at its scroll
  // position; otherwise (e.g. a deep link or hard refresh) navigate home so the
  // button never strands the user outside the app.
  const goBack = () => {
    if (hasInternalHistory()) {
      startViewTransition(() => window.history.back());
      return;
    }
    markInternalNavigation();
    startViewTransition(() =>
      navigate({ to: "/" } as Parameters<typeof navigate>[0])
    );
  };

  // Keyboard pager carried over from the old modal: a/d page, Escape closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack keys while the user is typing in a field (e.g. the
      // add-datapoint input on this page) — let a/d/Escape reach the input.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "a") return goPrev?.();
      if (e.key === "d") return goNext?.();
      if (e.key === "Escape") return goBack();
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
            goBack();
          }}
        >
          <ArrowLeft /> <span>Back</span>
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
