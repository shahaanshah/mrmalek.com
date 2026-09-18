import { Outlet, createFileRoute } from '@tanstack/react-router';
import adminCss from '@/styles/admin.css?url';

/**
 * Admin layout route. Everything under /admin loads the admin-only stylesheet
 * (Tailwind + shadcn tokens) — the public website never links it, so public
 * pages keep their own CSS untouched. Admin pages are never indexed.
 */
export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
      { name: 'googlebot', content: 'noindex, nofollow, noarchive, nosnippet' },
      { name: 'bingbot', content: 'noindex, nofollow, noarchive, nosnippet' },
    ],
    links: [{ rel: 'stylesheet', href: adminCss }],
  }),
  component: () => <Outlet />,
});
