import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Building2, Plus, Trash2, Edit2, ExternalLink, ArrowUpDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminListPartners, adminSavePartner, adminDeletePartner } from '@/lib/cms/landing.functions';
import { adminListMedia } from '@/lib/cms/content.functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PartnerItem {
  id: number;
  name: string;
  category: string;
  logo_image: string;
  logo_text: string;
  sort_order: number;
}

function ClientsPage() {
  const { session, partners, mediaItems } = Route.useLoaderData();
  const router = useRouter();
  const savePartnerFn = useServerFn(adminSavePartner);
  const deletePartnerFn = useServerFn(adminDeletePartner);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPartner, setEditingPartner] = React.useState<Partial<PartnerItem> | null>(null);
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditingPartner({
      name: '',
      category: 'Enterprise Client',
      logo_image: '',
      logo_text: '',
      sort_order: (partners.length + 1) * 10,
    });
    setDialogOpen(true);
  }

  function openEdit(partner: PartnerItem) {
    setEditingPartner({ ...partner });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPartner?.name?.trim()) {
      toast.error('Company name is required');
      return;
    }

    setBusy(true);
    try {
      await savePartnerFn({
        data: {
          id: editingPartner.id,
          name: editingPartner.name.trim(),
          category: editingPartner.category?.trim() || 'Client',
          logo_image: editingPartner.logo_image || '',
          logo_text: editingPartner.logo_text || '',
          sort_order: Number(editingPartner.sort_order) || 0,
        },
      });
      await router.invalidate();
      setDialogOpen(false);
      toast.success(editingPartner.id ? 'Partner updated' : 'Partner added');
    } catch {
      toast.error('Failed to save partner');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Are you sure you want to remove "${name}" from the logo marquee?`)) return;

    try {
      await deletePartnerFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed ${name}`);
    } catch {
      toast.error('Could not delete partner');
    }
  }

  return (
    <AdminLayout
      title="Client Partners & Logo Wall"
      description="Manage the enterprise and venture logos displayed in the high-impact logo marquee on the homepage."
      email={session.email}
      crumbs={[{ label: 'Client Partners' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" /> Live Preview
            </a>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add Partner Logo
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" /> Active Partner Wall ({partners.length})
          </CardTitle>
          <CardDescription>
            These brand logos scroll continuously in the banner strip below the Hero. Upload high-contrast transparent PNGs or clean SVGs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No partners configured. Click "Add Partner Logo" to add your first client.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between pb-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      Order #{partner.sort_order}
                    </span>
                    <span className="truncate text-xs font-medium text-muted-foreground">{partner.category}</span>
                  </div>

                  <div className="flex h-20 items-center justify-center rounded-lg border border-border/40 bg-muted/20 p-3">
                    {partner.logo_image ? (
                      <img
                        src={partner.logo_image}
                        alt={partner.name}
                        className="max-h-12 max-w-full object-contain filter transition-all group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-base font-bold tracking-wider text-muted-foreground">
                        {partner.logo_text || partner.name}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="truncate font-semibold text-sm">{partner.name}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(partner)}
                      >
                        <Edit2 className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(partner.id, partner.name)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
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
              <DialogTitle>{editingPartner?.id ? 'Edit Partner Logo' : 'Add Client Partner'}</DialogTitle>
              <DialogDescription>
                Configure the brand name, category tag, and upload high-res logo artwork.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="partner_name">Company / Client Name *</Label>
                <Input
                  id="partner_name"
                  required
                  value={editingPartner?.name || ''}
                  onChange={(e) => setEditingPartner((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. ASL Agrodrain, Lendo, Pass-on"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="partner_category">Category</Label>
                  <Input
                    id="partner_category"
                    value={editingPartner?.category || ''}
                    onChange={(e) => setEditingPartner((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. FinTech, Logistics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner_sort">Display Order</Label>
                  <Input
                    id="partner_sort"
                    type="number"
                    value={editingPartner?.sort_order ?? 0}
                    onChange={(e) =>
                      setEditingPartner((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo Artwork (Transparent PNG or SVG)</Label>
                <ImageUploader
                  value={editingPartner?.logo_image || ''}
                  onChange={(url) => setEditingPartner((prev) => ({ ...prev, logo_image: url }))}
                  help="Upload white/light-monochrome or transparent logo for optimal contrast."
                  mediaLibraryItems={mediaItems}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner_text">Fallback Typography / Monogram</Label>
                <Input
                  id="partner_text"
                  value={editingPartner?.logo_text || ''}
                  onChange={(e) => setEditingPartner((prev) => ({ ...prev, logo_text: e.target.value }))}
                  placeholder="Used if image is loading or missing"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingPartner?.id ? 'Update Partner' : 'Add Partner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/clients')({
  loader: async () => {
    const [session, partners, mediaItems] = await Promise.all([
      requireAdminSession(),
      adminListPartners(),
      adminListMedia(),
    ]);
    return { session, partners, mediaItems };
  },
  head: () => ({
    meta: [{ title: 'Client Partners | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: ClientsPage,
});
