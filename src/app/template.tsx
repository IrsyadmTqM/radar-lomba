/**
 * Re-mounts on every navigation, so each page fades in.
 * Opacity only: a transform here would break the pages' fixed bottom nav.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
