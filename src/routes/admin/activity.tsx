import { createFileRoute } from '@tanstack/react-router';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminActivity } from '@/lib/cms/content.functions';
import type { ActivityEntry } from '@/lib/cms/content.types';
import { Badge } from '@/components/ui/badge';

function ActivityPage() {
  const { session, entries } = Route.useLoaderData();

  const columns: Column<ActivityEntry>[] = [
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      value: (row) => row.action,
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.action}
        </Badge>
      ),
    },
    { key: 'entity', header: 'Item', value: (row) => row.entity_type, cell: (row) => <span>{row.entity_type}</span> },
    { key: 'summary', header: 'Details', value: (row) => row.summary, cell: (row) => <span>{row.summary}</span> },
    {
      key: 'who',
      header: 'By',
      hideOnMobile: true,
      value: (row) => row.admin_email ?? '',
      cell: (row) => <span className="text-muted-foreground">{row.admin_email ?? '—'}</span>,
    },
    {
      key: 'when',
      header: 'When',
      sortable: true,
      hideOnMobile: true,
      value: (row) => row.created_at,
      cell: (row) => <span className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>,
    },
  ];

  return (
    <AdminLayout
      title="Activity"
      description="A record of every change made in the studio."
      email={session.email}
      crumbs={[{ label: 'Activity' }]}
    >
      <DataTable
        rows={entries}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search activity…"
        emptyTitle="No activity yet"
        emptyDescription="Changes you make will be listed here."
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/activity')({
  loader: async () => {
    const [session, entries] = await Promise.all([requireAdminSession(), adminActivity()]);
    return { session, entries };
  },
  head: () => ({ meta: [{ title: 'Activity | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ActivityPage,
});
