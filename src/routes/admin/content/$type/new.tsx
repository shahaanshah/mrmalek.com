import { createFileRoute, notFound, useNavigate, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import AdminLayout from '@/components/admin/AdminLayout';
import ContentForm from '@/components/admin/ContentForm';
import { requireAdminSession, adminListCategories } from '@/lib/cms/admin.functions';
import { adminSaveContent } from '@/lib/cms/content.functions';
import { CONTENT_TYPE_CONFIG, type ContentInput } from '@/lib/cms/content.types';
import { typeFromSlug } from '@/lib/cms/content.routes';

function NewContentPage() {
  const { session, config, type, typeSlug, categories } = Route.useLoaderData();
  const save = useServerFn(adminSaveContent);
  const navigate = useNavigate();
  const router = useRouter();

  return (
    <AdminLayout
      title={`New ${config.label.toLowerCase()}`}
      description={`Manage the ${config.labelPlural.toLowerCase()} shown on the website.`}
      email={session.email}
      crumbs={[{ label: config.labelPlural }, { label: 'New' }]}
    >
      <ContentForm
        type={type}
        categories={categories}
        listPath={`/admin/content/${typeSlug}`}
        onSubmit={async (values: ContentInput) => {
          const result = await save({ data: { ...values, type } });
          if (result.ok) {
            await router.invalidate();
            navigate({ to: '/admin/content/$type/$id/edit', params: { type: typeSlug, id: String(result.id) } });
          }
          return result;
        }}
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/content/$type/new')({
  loader: async ({ params }) => {
    const type = typeFromSlug(params.type);
    if (!type) throw notFound();
    const config = CONTENT_TYPE_CONFIG[type];
    const [session, categories] = await Promise.all([
      requireAdminSession(),
      config.usesCategory ? adminListCategories() : Promise.resolve([]),
    ]);
    return { session, config, type, typeSlug: params.type, categories };
  },
  head: () => ({
    meta: [{ title: 'New content | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: NewContentPage,
});
