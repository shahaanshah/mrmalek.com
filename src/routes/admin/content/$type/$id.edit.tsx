import { createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import AdminLayout from '@/components/admin/AdminLayout';
import ContentForm from '@/components/admin/ContentForm';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireAdminSession, adminListCategories } from '@/lib/cms/admin.functions';
import { adminGetContent, adminSaveContent } from '@/lib/cms/content.functions';
import { CONTENT_TYPE_CONFIG, type ContentInput } from '@/lib/cms/content.types';
import { typeFromSlug } from '@/lib/cms/content.routes';

function EditContentPage() {
  const { session, config, type, typeSlug, record, categories } = Route.useLoaderData();
  const save = useServerFn(adminSaveContent);
  const router = useRouter();

  return (
    <AdminLayout
      title={record.title}
      description={`Editing ${config.label.toLowerCase()} details.`}
      email={session.email}
      crumbs={[{ label: config.labelPlural, to: `/admin/content/${typeSlug}` }, { label: 'Edit' }]}
      actions={<StatusBadge status={record.status} publishDate={record.publish_date} />}
    >
      <ContentForm
        type={type}
        record={record}
        categories={categories}
        listPath={`/admin/content/${typeSlug}`}
        onSubmit={async (values: ContentInput) => {
          const result = await save({ data: { ...values, type, id: record.id } });
          if (result.ok) await router.invalidate();
          return result;
        }}
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/content/$type/$id/edit')({
  loader: async ({ params }) => {
    const type = typeFromSlug(params.type);
    if (!type) throw notFound();
    const config = CONTENT_TYPE_CONFIG[type];
    const [session, record, categories] = await Promise.all([
      requireAdminSession(),
      adminGetContent({ data: { id: Number(params.id) } }),
      config.usesCategory ? adminListCategories() : Promise.resolve([]),
    ]);
    if (!record) throw notFound();
    return { session, config, type, typeSlug: params.type, record, categories };
  },
  head: () => ({
    meta: [{ title: 'Edit content | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: EditContentPage,
});
