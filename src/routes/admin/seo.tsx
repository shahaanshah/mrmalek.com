import { createFileRoute, useRouter } from '@tanstack/react-router';
import AdminLayout from '@/components/admin/AdminLayout';
import PageSeoCard from '@/components/admin/PageSeoCard';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminListPageSeo } from '@/lib/cms/content.functions';
import { PAGE_SEO_ROUTES } from '@/lib/cms/pageSeo';

function SeoPage() {
  const { session, pageSeo } = Route.useLoaderData();
  const router = useRouter();

  return (
    <AdminLayout
      title="SEO & Social Share Cards"
      description="Configure Google search snippet, OpenGraph social cards, canonical URL, and search engine indexing for your portfolio."
      email={session.email}
      crumbs={[{ label: 'SEO & Meta' }]}
    >
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Single-Page Website Metadata</h2>
          <p className="text-sm text-muted-foreground">
            These settings govern how mrmalek.com appears when indexed on search engines (Google, Bing) and when links are previewed on LinkedIn, X (Twitter), and messaging apps.
          </p>
        </div>

        {PAGE_SEO_ROUTES.map((route) => (
          <PageSeoCard
            key={route.path}
            route={route}
            seo={pageSeo[route.path]}
            onSaved={() => router.invalidate()}
          />
        ))}
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/seo')({
  loader: async () => {
    const [session, pageSeo] = await Promise.all([
      requireAdminSession(),
      adminListPageSeo(),
    ]);
    return { session, pageSeo };
  },
  head: () => ({
    meta: [
      { title: 'SEO & Meta | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SeoPage,
});
