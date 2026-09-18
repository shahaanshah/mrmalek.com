import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Upload,
  Search,
  Pencil,
  FileText,
  Loader2,
  Tag,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminDeleteMedia, adminListMedia, adminSaveMedia } from '@/lib/cms/content.functions';
import { adminUploadFile } from '@/lib/cms/upload.functions';
import { mediaSchema } from '@/lib/cms/content.types';
import type { MediaItem } from '@/lib/cms/content.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function MediaPage() {
  const { session, items } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(adminSaveMedia);
  const remove = useServerFn(adminDeleteMedia);
  const uploadFn = useServerFn(adminUploadFile);

  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  // Edit modal state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MediaItem | null>(null);
  const [editForm, setEditForm] = React.useState({
    file_name: '',
    alt_text: '',
    usage_note: '',
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Direct upload handler for multiple or single files
  async function handleFilesUpload(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    setUploading(true);
    let successCount = 0;

    for (const file of fileArray) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 15MB limit`);
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await uploadFn({
          data: {
            name: file.name,
            type: file.type || 'application/octet-stream',
            base64,
            usageNote: 'Media Studio Upload',
          },
        });

        if (res.ok) {
          successCount++;
        } else {
          toast.error(res.error || `Upload failed for ${file.name}`);
        }
      } catch {
        toast.error(`Error processing ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      await router.invalidate();
      toast.success(`Successfully uploaded ${successCount} asset${successCount > 1 ? 's' : ''}!`);
    }
  }

  // Open edit modal for an item
  function openEditModal(item: MediaItem) {
    setEditingItem(item);
    setEditForm({
      file_name: item.file_name,
      alt_text: item.alt_text || '',
      usage_note: item.usage_note || '',
    });
    setEditDialogOpen(true);
  }

  // Save changes to an existing media item (URL is permanent and untouched)
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    if (!editForm.file_name.trim()) {
      toast.error('Asset name is required');
      return;
    }

    const parsed = mediaSchema.safeParse({
      file_name: editForm.file_name.trim(),
      url: editingItem.url,
      alt_text: editForm.alt_text.trim(),
      usage_note: editForm.usage_note.trim(),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Invalid input details');
      return;
    }

    setBusy(true);
    try {
      await save({
        data: {
          id: editingItem.id,
          ...parsed.data,
        },
      });
      await router.invalidate();
      setEditDialogOpen(false);
      setEditingItem(null);
      toast.success('Media asset details updated!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save asset details.');
    } finally {
      setBusy(false);
    }
  }

  // Manual URL entry
  async function onAddManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const parsed = mediaSchema.safeParse({
      file_name: String(data.get('file_name') ?? '').trim(),
      url: String(data.get('url') ?? '').trim(),
      alt_text: String(data.get('alt_text') ?? '').trim(),
      usage_note: String(data.get('usage_note') ?? '').trim(),
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the input details');
      return;
    }

    setBusy(true);
    try {
      await save({ data: parsed.data });
      form.reset();
      await router.invalidate();
      toast.success('Media entry added to library');
    } catch {
      toast.error('Could not save media entry.');
    } finally {
      setBusy(false);
    }
  }

  function copyToClipboard(id: number, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredItems = items.filter((item) =>
    (item.file_name + ' ' + (item.usage_note || '') + ' ' + (item.alt_text || ''))
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminLayout
      title="Media & Document Library"
      description="Upload and manage brand photos, client logos, graphics, and documents with fast asset previews."
      email={session.email}
      crumbs={[{ label: 'Media' }]}
    >
      {/* UPLOAD & ADD ASSET SECTION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="size-5 text-primary" /> Upload & Add Media
          </CardTitle>
          <CardDescription>
            Files are automatically assigned a clean, consistent name pattern and stored in your project storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upload">Direct File Upload</TabsTrigger>
              <TabsTrigger value="url">External / Existing URL</TabsTrigger>
            </TabsList>

            {/* Direct Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files) {
                    void handleFilesUpload(e.dataTransfer.files);
                  }
                }}
                onClick={() => {
                  if (!uploading) fileInputRef.current?.click();
                }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center transition-colors hover:border-primary/60 hover:bg-muted/30"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 py-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-foreground">Processing & uploading files...</p>
                    <p className="text-xs text-muted-foreground">Generating short consistent names and indexing in library</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="size-6" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-primary underline-offset-4 hover:underline">
                        Click to browse
                      </span>{' '}
                      <span className="text-muted-foreground">or drag and drop images & documents</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, JPEG, SVG, WebP, GIF, or PDF up to 15MB each
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                      <Info className="size-3 text-primary" />
                      Uploaded files automatically receive shorter, consistent IDs using MD5 (e.g. img-a3e91b2c.png)
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif,image/x-icon,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      void handleFilesUpload(e.target.files);
                    }
                  }}
                />
              </div>
            </TabsContent>

            {/* Manual URL Tab */}
            <TabsContent value="url">
              <form onSubmit={onAddManual} className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="file_name">Asset Name / Title *</Label>
                  <Input id="file_name" name="file_name" placeholder="e.g. hero-banner.png or Pass On Logo" required />
                  <p className="text-[11px] text-muted-foreground">Descriptive name used to search and display in pickers.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">Direct URL or Local Path *</Label>
                  <Input id="url" name="url" placeholder="/uploads/... or https://..." required />
                  <p className="text-[11px] text-muted-foreground">Local path (/uploads/...) or external CDN URL.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="alt_text">Accessibility Alt Text</Label>
                  <Input id="alt_text" name="alt_text" placeholder="Describes the visual for SEO and screen readers" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="usage_note">Usage Location (Optional)</Label>
                  <Input id="usage_note" name="usage_note" placeholder="e.g. Hero Section, Partner Marquee" />
                </div>
                <div className="md:col-span-2 pt-1">
                  <Button type="submit" disabled={busy}>
                    <Plus className="size-4 mr-1.5" /> Save to Library
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* SEARCH AND ASSET GRID */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              All Library Assets ({filteredItems.length} of {items.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Click "Edit" on any asset to rename, add alt text, update its URL, or configure usage notes.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, alt text, or usage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            {items.length === 0 ? 'No files in library yet. Upload an asset above.' : 'No assets match your search query.'}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-sm"
              >
                {/* Thumbnail Header */}
                <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-muted/40 p-2">
                  {item.url.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center gap-1 text-destructive">
                      <FileText className="size-10" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">PDF Document</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.file_name}
                      className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="size-7 bg-background/85 shadow-sm backdrop-blur"
                      title="Open full file in new tab"
                    >
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Card Content & Details */}
                <CardContent className="flex flex-1 flex-col justify-between gap-3 p-3">
                  <div className="space-y-1.5">
                    <p className="truncate text-xs font-semibold text-foreground" title={item.file_name}>
                      {item.file_name}
                    </p>

                    {/* Alt Text Preview */}
                    {item.alt_text ? (
                      <p
                        className="flex items-center gap-1 truncate text-[11px] text-muted-foreground"
                        title={`Alt text: ${item.alt_text}`}
                      >
                        <Tag className="size-3 shrink-0 text-primary/70" />
                        <span className="truncate">{item.alt_text}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] italic text-muted-foreground/60">No alt text set</p>
                    )}

                    {/* URL preview */}
                    <p className="truncate font-mono text-[10px] text-muted-foreground/80" title={item.url}>
                      {item.url}
                    </p>

                    {item.usage_note && (
                      <p className="truncate text-[10px] text-primary/80" title={`Usage: ${item.usage_note}`}>
                        📍 {item.usage_note}
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-2">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => openEditModal(item)}
                      >
                        <Pencil className="mr-1 size-3" /> Edit
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => copyToClipboard(item.id, item.url)}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="mr-1 size-3 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 size-3" /> Copy
                          </>
                        )}
                      </Button>
                    </div>

                    <ConfirmDelete
                      title={`Delete "${item.file_name}"?`}
                      description="This removes the item record from your media library."
                      onConfirm={async () => {
                        await remove({ data: { id: item.id } });
                        await router.invalidate();
                        toast.success('Asset removed');
                      }}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:bg-destructive/10"
                          title="Delete asset"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* EDIT ASSET MODAL */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4 text-primary" /> Edit Media Asset
            </DialogTitle>
            <DialogDescription>
              Update the display name, accessibility alt text, usage notes, or file URL.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Asset Preview Banner */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
                  {editingItem.url.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="size-8 text-destructive" />
                  ) : (
                    <img
                      src={editingItem.url}
                      alt={editForm.alt_text || editForm.file_name}
                      className="size-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {editForm.file_name || editingItem.file_name}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {editingItem.url}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(editingItem.id, editingItem.url)}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <Copy className="size-3" /> Copy URL
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <a
                      href={editingItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" /> Open in new tab
                    </a>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-medium">
                    Media / Asset Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.file_name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, file_name: e.target.value }))}
                    placeholder="e.g. hero-portrait.png or Pass On Company Logo"
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Friendly label to identify this asset across your admin panel and pickers.
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="edit-alt" className="text-xs font-medium">
                    Accessibility Alt Text (SEO)
                  </Label>
                  <Input
                    id="edit-alt"
                    value={editForm.alt_text}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="Describe the image content for Google & screen readers"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Important for accessibility and SEO image search ranking.
                  </p>
                </div>

                {/* Permanent Asset URL / Path (Read-only) */}
                <div className="grid gap-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Asset File Path / URL (Permanent)
                  </Label>
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs font-mono text-foreground">
                    <span className="truncate flex-1 select-all" title={editingItem.url}>
                      {editingItem.url}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                      onClick={() => copyToClipboard(editingItem.id, editingItem.url)}
                    >
                      {copiedId === editingItem.id ? (
                        <>
                          <Check className="mr-1 size-3 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 size-3" /> Copy
                        </>
                      )}
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      title="Open file in new tab"
                    >
                      <a href={editingItem.url} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    File paths are fixed to prevent broken links across your site.
                  </p>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="edit-note" className="text-xs font-medium">
                    Usage Location / Note (Optional)
                  </Label>
                  <Input
                    id="edit-note"
                    value={editForm.usage_note}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, usage_note: e.target.value }))}
                    placeholder="e.g. Hero section, Pass On Venture, Partner Marquee"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditDialogOpen(false);
                    setEditingItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null} Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/media')({
  loader: async () => {
    const [session, items] = await Promise.all([requireAdminSession(), adminListMedia()]);
    return { session, items };
  },
  head: () => ({
    meta: [{ title: 'Media & Documents | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: MediaPage,
});
