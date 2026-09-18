import * as React from 'react';
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Copy, ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminDeleteContent,
  adminDuplicateContent,
  adminBulkContent,
  adminListContent,
  adminSetContentFeatured,
  adminSetContentStatus,
} from '@/lib/cms/content.functions';
import { CONTENT_TYPE_CONFIG, type ContentRecord } from '@/lib/cms/content.types';
import { typeFromSlug } from '@/lib/cms/content.routes';
import { formatDate } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

function ContentListPage() {
  const { session, items, config, typeSlug } = Route.useLoaderData();
  const router = useRouter();
  const setStatus = useServerFn(adminSetContentStatus);
  const setFeatured = useServerFn(adminSetContentFeatured);
  const remove = useServerFn(adminDeleteContent);
  const duplicate = useServerFn(adminDuplicateContent);
  const bulk = useServerFn(adminBulkContent);
  const [busy, setBusy] = React.useState(false);

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await action();
      await router.invalidate();
      toast.success(message);
    } catch {
      toast.error('That did not work. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const columns: Column<ContentRecord>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      value: (row) => row.title,
      cell: (row) => {
        const subtitle =
          typeSlug === 'case-studies'
            ? [row.details?.['client'] ? `Client: ${row.details['client']}` : null, row.category_name || 'Case Study', `Drawer #${row.slug}`].filter(Boolean).join(' · ')
            : typeSlug === 'ventures'
              ? [row.details?.['venture_status'] || 'Active Venture', 'Ecosystem Card', `Anchor #${row.slug}`].filter(Boolean).join(' · ')
              : typeSlug === 'frameworks'
                ? [row.details?.['step_label'] ? `Phase ${row.details['step_label']}` : 'Process Step', '4-Phase Roadmap', `Anchor #${row.slug}`].filter(Boolean).join(' · ')
                : `Landing Item · Anchor #${row.slug}`;

        return (
          <div>
            <Link
              to="/admin/content/$type/$id/edit"
              params={{ type: typeSlug, id: String(row.id) }}
              className="font-medium hover:underline"
            >
              {row.title}
            </Link>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      value: (row) => row.status,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.status === 'published'}
            disabled={busy}
            onCheckedChange={(checked) =>
              run(
                () => setStatus({ data: { id: row.id, status: checked ? 'published' : 'draft' } }),
                checked ? 'Published' : 'Moved to draft',
              )
            }
            aria-label="Toggle published"
          />
          <StatusBadge status={row.status} publishDate={row.publish_date} />
        </div>
      ),
    },
    ...(config.usesFeatured
      ? [
          {
            key: 'featured',
            header: 'Featured',
            hideOnMobile: true,
            cell: (row: ContentRecord) => (
              <Button
                variant="ghost"
                size="icon"
                disabled={busy}
                aria-label="Toggle featured"
                onClick={() =>
                  run(
                    () => setFeatured({ data: { id: row.id, featured: !row.is_featured } }),
                    row.is_featured ? 'Removed from featured' : 'Marked as featured',
                  )
                }
              >
                <Star className={row.is_featured ? 'size-4 fill-current text-amber-400' : 'size-4 text-muted-foreground'} />
              </Button>
            ),
          } satisfies Column<ContentRecord>,
        ]
      : []),
    {
      key: 'updated',
      header: 'Updated',
      sortable: true,
      hideOnMobile: true,
      value: (row) => row.updated_at,
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.updated_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" aria-label="Duplicate" disabled={busy} onClick={() => run(() => duplicate({ data: { id: row.id } }), 'Draft copy created')}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Edit">
            <Link to="/admin/content/$type/$id/edit" params={{ type: typeSlug, id: String(row.id) }}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <ConfirmDelete
            title={`Delete "${row.title}"?`}
            onConfirm={() => run(() => remove({ data: { id: row.id } }), 'Deleted')}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Delete">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title={config.labelPlural}
      description={`Manage the ${config.labelPlural.toLowerCase()} shown on the website.`}
      email={session.email}
      crumbs={[{ label: config.labelPlural }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" /> View site
            </a>
          </Button>
          <Button asChild>
            <Link to="/admin/content/$type/new" params={{ type: typeSlug }}>
              <Plus className="size-4" /> New
            </Link>
          </Button>
        </div>
      }
    >
      <DataTable
        rows={items}
        columns={columns}
        rowKey={(row) => row.id}
        selectable
        bulkActions={(selected, clear) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => bulk({ data: { ids: selected.map((item) => item.id), action: 'publish' } }), 'Items published').then(clear)}>Publish</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => bulk({ data: { ids: selected.map((item) => item.id), action: 'draft' } }), 'Items moved to draft').then(clear)}>Move to draft</Button>
            <ConfirmDelete title={`Delete ${selected.length} selected items?`} description="This cannot be undone." onConfirm={() => run(() => bulk({ data: { ids: selected.map((item) => item.id), action: 'delete' } }), 'Items deleted').then(clear)} trigger={<Button size="sm" variant="destructive" disabled={busy}>Delete</Button>} />
          </div>
        )}
        searchPlaceholder={`Search ${config.labelPlural.toLowerCase()}…`}
        emptyTitle={`No ${config.labelPlural.toLowerCase()} yet`}
        emptyDescription="Create your first one and it will show up here."
        emptyAction={
          <Button asChild>
            <Link to="/admin/content/$type/new" params={{ type: typeSlug }}>
              <Plus className="size-4" /> Create
            </Link>
          </Button>
        }
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/content/$type/')({
  loader: async ({ params }) => {
    const type = typeFromSlug(params.type);
    if (!type) throw notFound();
    const [session, items] = await Promise.all([requireAdminSession(), adminListContent({ data: { type } })]);
    return { session, items, config: CONTENT_TYPE_CONFIG[type], typeSlug: params.type };
  },
  head: () => ({
    meta: [{ title: 'Content | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: ContentListPage,
});
