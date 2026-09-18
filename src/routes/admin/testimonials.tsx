import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Quote, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListTestimonials,
  adminSaveTestimonial,
  adminDeleteTestimonial,
} from '@/lib/cms/landing.functions';
import { adminListMedia } from '@/lib/cms/content.functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TestimonialItem {
  id: number;
  author: string;
  role: string;
  company: string;
  quote: string;
  linkedin?: string | null;
  avatar_url?: string | null;
  sort_order: number;
}

function TestimonialsPage() {
  const { session, testimonials, mediaItems } = Route.useLoaderData();
  const router = useRouter();
  const saveTestimonialFn = useServerFn(adminSaveTestimonial);
  const deleteTestimonialFn = useServerFn(adminDeleteTestimonial);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Partial<TestimonialItem> | null>(null);
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditingItem({
      author: '',
      role: '',
      company: '',
      quote: '',
      linkedin: '',
      avatar_url: '',
      sort_order: (testimonials.length + 1) * 10,
    });
    setDialogOpen(true);
  }

  function openEdit(item: TestimonialItem) {
    setEditingItem({ ...item });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem?.author?.trim() || !editingItem?.quote?.trim()) {
      toast.error('Author name and Testimonial quote are required');
      return;
    }

    setBusy(true);
    try {
      await saveTestimonialFn({
        data: {
          id: editingItem.id,
          author: editingItem.author.trim(),
          role: editingItem.role || '',
          company: editingItem.company || '',
          quote: editingItem.quote.trim(),
          linkedin: editingItem.linkedin?.trim() || null,
          avatar_url: editingItem.avatar_url || null,
          sort_order: Number(editingItem.sort_order) || 0,
        },
      });
      await router.invalidate();
      setDialogOpen(false);
      toast.success(editingItem.id ? 'Testimonial updated' : 'Testimonial added');
    } catch {
      toast.error('Failed to save testimonial');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, author: string) {
    if (!confirm(`Delete testimonial from "${author}"?`)) return;
    try {
      await deleteTestimonialFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed testimonial from ${author}`);
    } catch {
      toast.error('Could not delete testimonial');
    }
  }

  return (
    <AdminLayout
      title="Client Testimonials & Recommendations"
      description="Manage peer endorsements, stakeholder recommendations, and verified LinkedIn profile links."
      email={session.email}
      crumbs={[{ label: 'Testimonials' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" /> Live Preview
            </a>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add Recommendation
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Quote className="size-5 text-primary" /> Active Endorsements ({testimonials.length})
          </CardTitle>
          <CardDescription>
            These quotes build trust and validate delivery impact. Each testimonial includes an optional direct LinkedIn verification link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No testimonials configured. Click "Add Recommendation" to create one.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {item.avatar_url ? (
                          <img
                            src={item.avatar_url}
                            alt={item.author}
                            className="size-10 rounded-full object-cover border border-border"
                          />
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {item.author.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{item.author}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.role} {item.company && `• ${item.company}`}
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        #{item.sort_order}
                      </span>
                    </div>

                    <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
                      "{item.quote}"
                    </p>

                    {item.linkedin && (
                      <div className="mt-3">
                        <a
                          href={item.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                        >
                          <svg className="size-3 fill-current" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-1 border-t pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => openEdit(item)}
                    >
                      <Edit2 className="mr-1.5 size-3.5" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(item.id, item.author)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? 'Edit Testimonial' : 'Add Client Recommendation'}</DialogTitle>
              <DialogDescription>
                Add client or colleague quote, their professional title, and LinkedIn reference link.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <div className="space-y-1">
                <Label htmlFor="t_author">Author Name *</Label>
                <Input
                  id="t_author"
                  required
                  value={editingItem?.author || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, author: e.target.value }))}
                  placeholder="e.g. Faisal Al-Rasheed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="t_role">Role / Title</Label>
                  <Input
                    id="t_role"
                    value={editingItem?.role || ''}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Chief Operating Officer"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="t_company">Company / Organization</Label>
                  <Input
                    id="t_company"
                    value={editingItem?.company || ''}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Logistics Enterprise"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="t_quote">Endorsement Quote *</Label>
                <Textarea
                  id="t_quote"
                  required
                  rows={4}
                  value={editingItem?.quote || ''}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, quote: e.target.value }))}
                  placeholder="Detailed endorsement of your leadership, architectural clarity, and delivery speed..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="t_linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="t_linkedin"
                    value={editingItem?.linkedin || ''}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="t_sort">Display Order</Label>
                  <Input
                    id="t_sort"
                    type="number"
                    value={editingItem?.sort_order ?? 0}
                    onChange={(e) =>
                      setEditingItem((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Author Headshot / Avatar (Optional)</Label>
                <ImageUploader
                  value={editingItem?.avatar_url || ''}
                  onChange={(url) => setEditingItem((prev) => ({ ...prev, avatar_url: url }))}
                  help="Square portrait image."
                  mediaLibraryItems={mediaItems}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingItem?.id ? 'Update Testimonial' : 'Add Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/testimonials')({
  loader: async () => {
    const [session, testimonials, mediaItems] = await Promise.all([
      requireAdminSession(),
      adminListTestimonials(),
      adminListMedia(),
    ]);
    return { session, testimonials, mediaItems };
  },
  head: () => ({
    meta: [{ title: 'Testimonials | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: TestimonialsPage,
});
