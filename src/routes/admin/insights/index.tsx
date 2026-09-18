import * as React from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Copy, ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import {
  adminDeleteVideo,
  adminDuplicateVideo,
  adminBulkVideos,
  adminListCategories,
  adminListVideos,
  adminSetFeatured,
  adminSetPublished,
  requireAdminSession,
} from '@/lib/cms/admin.functions';
import { derivedThumbnail, formatDate, type VideoWithCategory } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function InsightsAdminPage() {
  const { session, videos, categories } = Route.useLoaderData();
  const router = useRouter();
  const setPublished = useServerFn(adminSetPublished);
  const setFeatured = useServerFn(adminSetFeatured);
  const deleteVideo = useServerFn(adminDeleteVideo);
  const duplicateVideo = useServerFn(adminDuplicateVideo);
  const bulkVideos = useServerFn(adminBulkVideos);

  const [status, setStatus] = React.useState<'all' | 'published' | 'draft'>('all');
  const [topic, setTopic] = React.useState<string>('all');
  const [busy, setBusy] = React.useState(false);

  const rows = videos.filter((video) => {
    if (status === 'published' && video.is_published !== 1) return false;
    if (status === 'draft' && video.is_published !== 0) return false;
    if (topic !== 'all' && String(video.category_id) !== topic) return false;
    return true;
  });

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

  const columns: Column<VideoWithCategory>[] = [
    {
      key: 'thumb',
      header: '',
      hideOnMobile: true,
      cell: (row) => {
        const thumb = derivedThumbnail(row);
        return thumb ? (
          <img src={thumb} alt="" loading="lazy" className="h-10 w-16 rounded object-cover" />
        ) : (
          <div className="h-10 w-16 rounded bg-muted" />
        );
      },
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      value: (row) => row.title,
      cell: (row) => (
        <div>
          <Link to="/admin/insights/$id/edit" params={{ id: String(row.id) }} className="font-medium hover:underline">
            {row.title}
          </Link>
          <p className="text-xs text-muted-foreground">{row.duration ? `${row.duration} · In-page video breakdown` : 'In-page video breakdown'}</p>
        </div>
      ),
    },
    {
      key: 'topic',
      header: 'Topic',
      hideOnMobile: true,
      sortable: true,
      value: (row) => row.category_name ?? '',
      cell: (row) => <span>{row.category_name ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      value: (row) => row.is_published,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.is_published === 1}
            disabled={busy}
            aria-label="Toggle published"
            onCheckedChange={(checked) =>
              run(
                () => setPublished({ data: { id: row.id, published: checked } }),
                checked ? 'Published' : 'Moved to draft',
              )
            }
          />
          <StatusBadge status={row.is_published ? 'published' : 'draft'} publishDate={row.publish_date} />
        </div>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      hideOnMobile: true,
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          disabled={busy}
          aria-label="Toggle featured"
          onClick={() =>
            run(
              () => setFeatured({ data: { id: row.id, featured: row.is_featured !== 1 } }),
              row.is_featured ? 'Removed from featured' : 'Marked as featured',
            )
          }
        >
          <Star className={row.is_featured ? 'size-4 fill-current text-amber-400' : 'size-4 text-muted-foreground'} />
        </Button>
      ),
    },
    {
      key: 'date',
      header: 'Publish date',
      hideOnMobile: true,
      sortable: true,
      value: (row) => row.publish_date ?? '',
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.publish_date) || '—'}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.is_published === 1 && (
            <Button variant="ghost" size="icon" asChild aria-label="Preview on landing page">
              <a href="/#insights" target="_blank" rel="noreferrer" title="Preview on landing page"><ExternalLink className="size-4" /></a>
            </Button>
          )}
          <Button variant="ghost" size="icon" disabled={busy} aria-label="Duplicate" onClick={() => run(() => duplicateVideo({ data: { id: row.id } }), 'Draft copy created')}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Edit">
            <Link to="/admin/insights/$id/edit" params={{ id: String(row.id) }}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <ConfirmDelete
            title={`Delete "${row.title}"?`}
            onConfirm={() => run(() => deleteVideo({ data: { id: row.id } }), 'Deleted')}
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
      title="PM Talks"
      description="Create, publish and feature your weekly episodes."
      email={session.email}
      crumbs={[{ label: 'PM Talks' }]}
      actions={
        <Button asChild>
          <Link to="/admin/insights/new">
            <Plus className="size-4" /> Add video
          </Link>
        </Button>
      }
    >
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(row) => row.id}
        selectable
        bulkActions={(selected, clear) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => bulkVideos({ data: { ids: selected.map((item) => item.id), action: 'publish' } }), 'Episodes published').then(clear)}>Publish</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => bulkVideos({ data: { ids: selected.map((item) => item.id), action: 'draft' } }), 'Episodes moved to draft').then(clear)}>Move to draft</Button>
            <ConfirmDelete title={`Delete ${selected.length} selected episodes?`} description="This cannot be undone." onConfirm={() => run(() => bulkVideos({ data: { ids: selected.map((item) => item.id), action: 'delete' } }), 'Episodes deleted').then(clear)} trigger={<Button size="sm" variant="destructive" disabled={busy}>Delete</Button>} />
          </div>
        )}
        searchPlaceholder="Search videos…"
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        emptyTitle="No videos yet"
        emptyDescription="Add your first PM Talks episode."
        emptyAction={
          <Button asChild>
            <Link to="/admin/insights/new">
              <Plus className="size-4" /> Add video
            </Link>
          </Button>
        }
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/insights/')({
  loader: async () => {
    const [session, videos, categories] = await Promise.all([
      requireAdminSession(),
      adminListVideos(),
      adminListCategories(),
    ]);
    return { session, videos, categories };
  },
  head: () => ({
    meta: [{ title: 'PM Talks | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: InsightsAdminPage,
});
