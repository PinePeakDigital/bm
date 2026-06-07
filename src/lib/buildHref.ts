// Fill `$param` placeholders in a route path with concrete, URL-encoded values
// so a link points somewhere real even before JS runs (e.g. "/goal/$slug" +
// {slug:"weight"} -> "/goal/weight"). A missing param resolves to an empty
// segment rather than leaving the literal placeholder in the URL.
//
// The single place this interpolation lives, so the anchor's href and the
// router's navigation target are built the same way everywhere.
export default function buildHref(
  to: string,
  params?: Record<string, string>
): string {
  return to.replace(/\$(\w+)/g, (_, key: string) =>
    encodeURIComponent(params?.[key] ?? "")
  );
}
