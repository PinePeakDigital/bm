import { ComponentChildren } from "preact";
import { JSX } from "preact/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { isPlainLeftClick, startViewTransition } from "../lib/viewTransition";
import buildHref from "../lib/buildHref";

// A real anchor that navigates client-side (inside a view transition) on a
// plain left click, and otherwise lets the browser do its normal thing.
export default function ViewLink({
  to,
  params,
  children,
  ...rest
}: {
  to: string;
  params?: Record<string, string>;
  children: ComponentChildren;
} & Omit<JSX.HTMLAttributes<HTMLAnchorElement>, "href">) {
  const navigate = useNavigate();
  const href = buildHref(to, params);
  // Pull a consumer-supplied onClick out of the spread so it composes with our
  // navigation handler instead of replacing it (a later {...rest} onClick would
  // silently disable client-side navigation).
  const { onClick, ...anchorProps } = rest;

  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (!isPlainLeftClick(e)) return;
        e.preventDefault();
        startViewTransition(() =>
          // Cast: the beta router's navigate is generically typed against the
          // route tree; `params` is an object the runtime threads through
          // functionalUpdate, so widen through unknown.
          navigate({ to, params } as unknown as Parameters<typeof navigate>[0])
        );
      }}
      {...anchorProps}
    >
      {children}
    </a>
  );
}
