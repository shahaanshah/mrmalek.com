import * as React from 'react';
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Copy, ExternalLink, Image as ImageIcon, Pencil, Plus, Save, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import ImageUploader from '@/components/admin/ImageUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminDeleteContent,
  adminDuplicateContent,
  adminBulkContent,
  adminListContent,
  adminListMedia,
  adminSetContentFeatured,
  adminSetContentStatus,
} from '@/lib/cms/content.functions';
import { adminGetHomepage, adminSaveHomepage } from '@/lib/cms/homepage.functions';
import { CONTENT_TYPE_CONFIG, type ContentRecord } from '@/lib/cms/content.types';
import { typeFromSlug } from '@/lib/cms/content.routes';
import { formatDate } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

function ContentListPage() {
  const { session, items, config, typeSlug, homepageContent, mediaItems } = Route.useLoaderData();
  const router = useRouter();
  const setStatus = useServerFn(adminSetContentStatus);
  const setFeatured = useServerFn(adminSetContentFeatured);
  const remove = useServerFn(adminDeleteContent);
  const duplicate = useServerFn(adminDuplicateContent);
  const bulk = useServerFn(adminBulkContent);
  const saveHomepage = useServerFn(adminSaveHomepage);
  const [busy, setBusy] = React.useState(false);

  const [processImage, setProcessImage] = React.useState<string>(
    homepageContent?.process_image || '/images/malek-side-potrait.png',
  );
  const [processBgImage, setProcessBgImage] = React.useState<string>(
    homepageContent?.process_bg_image || '/images/process-nebula-bg.jpg',
  );
  const [savingImage, setSavingImage] = React.useState(false);

  React.useEffect(() => {
    if (homepageContent?.process_image) {
      setProcessImage(homepageContent.process_image);
    }
    if (homepageContent?.process_bg_image) {
      setProcessBgImage(homepageContent.process_bg_image);
    }
  }, [homepageContent?.process_image, homepageContent?.process_bg_image]);

  async function handleSaveProcessImages() {
    setSavingImage(true);
    try {
      await saveHomepage({
        data: {
          ...homepageContent,
          process_image: processImage,
          process_bg_image: processBgImage,
        },
      });
      await router.invalidate();
      toast.success('Section visuals saved successfully!');
    } catch {
      toast.error('Could not save section visuals.');
    } finally {
      setSavingImage(false);
    }
  }

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
      {typeSlug === 'frameworks' && (
        <Card className="mb-6 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" /> How I Work Section Images & Visuals
            </CardTitle>
            <CardDescription className="text-xs">
              Malek&rsquo;s portrait inside the hexagon frame and the cosmic nebula background behind the section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <ImageUploader
                id="process_section_image"
                label="Process Portrait / Graphic"
                value={processImage}
                onChange={setProcessImage}
                help="Recommended: Transparent PNG. Default: /images/malek-side-potrait.png"
                mediaLibraryItems={mediaItems}
              />
              <ImageUploader
                id="process_section_bg_image"
                label="Cosmic Nebula Background"
                value={processBgImage}
                onChange={setProcessBgImage}
                help="Recommended: Cosmic nebula image. Default: /images/process-nebula-bg.jpg"
                mediaLibraryItems={mediaItems}
              />
            </div>
            <Button
              type="button"
              size="sm"
              disabled={
                savingImage ||
                (processImage === (homepageContent?.process_image || '/images/malek-side-potrait.png') &&
                  processBgImage === (homepageContent?.process_bg_image || '/images/process-nebula-bg.jpg'))
              }
              onClick={handleSaveProcessImages}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              {savingImage ? 'Saving...' : 'Save Section Visuals'}
            </Button>
          </CardContent>
        </Card>
      )}

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
    let homepageContent = null;
    let mediaItems: any[] = [];
    if (params.type === 'frameworks') {
      const [home, media] = await Promise.all([adminGetHomepage(), adminListMedia()]);
      homepageContent = home;
      mediaItems = media;
    }
    return { session, items, config: CONTENT_TYPE_CONFIG[type], typeSlug: params.type, homepageContent, mediaItems };
  },
  head: () => ({
    meta: [{ title: 'Content | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: ContentListPage,
});
