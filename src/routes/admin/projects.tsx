import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { FolderGit2, Plus, Trash2, Edit2, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListOtherProjects,
  adminSaveOtherProject,
  adminDeleteOtherProject,
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

interface OtherProjectItem {
  id: number;
  name: string;
  domain: string;
  role: string;
  summary: string;
  logo_image?: string | null;
  sort_order: number;
}

function ProjectsPage() {
  const { session, otherProjects, mediaItems } = Route.useLoaderData();
  const router = useRouter();
  const saveProjectFn = useServerFn(adminSaveOtherProject);
  const deleteProjectFn = useServerFn(adminDeleteOtherProject);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingProj, setEditingProj] = React.useState<Partial<OtherProjectItem> | null>(null);
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditingProj({
      name: '',
      domain: '',
      role: 'Product Lead',
      summary: '',
      logo_image: '',
      sort_order: (otherProjects.length + 1) * 10,
    });
    setDialogOpen(true);
  }

  function openEdit(item: OtherProjectItem) {
    setEditingProj({ ...item });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProj?.name?.trim()) {
      toast.error('Project name is required');
      return;
    }

    setBusy(true);
    try {
      await saveProjectFn({
        data: {
          id: editingProj.id,
          name: editingProj.name.trim(),
          domain: editingProj.domain || '',
          role: editingProj.role || '',
          summary: editingProj.summary || '',
          logo_image: editingProj.logo_image || null,
          sort_order: Number(editingProj.sort_order) || 0,
        },
      });
      await router.invalidate();
      setDialogOpen(false);
      toast.success(editingProj.id ? 'Project updated' : 'Project added');
    } catch {
      toast.error('Failed to save project');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete project badge "${name}"?`)) return;
    try {
      await deleteProjectFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed ${name}`);
    } catch {
      toast.error('Could not delete project');
    }
  }

  return (
    <AdminLayout
      title="Other Projects & Engagements"
      description="Manage secondary project engagements, client badges, and specialized domain initiatives (TUBY, AEC, KUNOOZ, 3YSHAH, etc.)."
      email={session.email}
      crumbs={[{ label: 'Other Projects' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" /> Live Preview
            </a>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add Project Badge
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="size-5 text-primary" /> Active Project Badges ({otherProjects.length})
          </CardTitle>
          <CardDescription>
            These engagements are displayed in the "Other Notable Projects" section with role badges and domain tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otherProjects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No project badges configured. Click "Add Project Badge" to create one.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {otherProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        {proj.logo_image ? (
                          <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/20 p-1.5">
                            <img src={proj.logo_image} alt={proj.name} className="size-full object-contain" />
                          </div>
                        ) : (
                          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                            {proj.name.slice(0, 3).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-base text-foreground">{proj.name}</h3>
                          <p className="text-xs text-primary font-medium">{proj.domain}</p>
                        </div>
                      </div>

                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Order #{proj.sort_order}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="inline-block rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground">
                        {proj.role}
                      </span>
                      {proj.summary && (
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{proj.summary}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-1 border-t pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => openEdit(proj)}
                    >
                      <Edit2 className="mr-1.5 size-3.5" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(proj.id, proj.name)}
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
              <DialogTitle>{editingProj?.id ? 'Edit Project Badge' : 'Add Project Badge'}</DialogTitle>
              <DialogDescription>
                Configure the initiative title, domain classification, leadership role, and project summary.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="proj_name">Project / Brand Name *</Label>
                  <Input
                    id="proj_name"
                    required
                    value={editingProj?.name || ''}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. TUBY"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="proj_domain">Domain / Industry</Label>
                  <Input
                    id="proj_domain"
                    value={editingProj?.domain || ''}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, domain: e.target.value }))}
                    placeholder="e.g. Entertainment & Media"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="proj_role">Role Performed</Label>
                  <Input
                    id="proj_role"
                    value={editingProj?.role || ''}
                    onChange={(e) => setEditingProj((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Technical Product Manager"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="proj_sort">Display Order</Label>
                  <Input
                    id="proj_sort"
                    type="number"
                    value={editingProj?.sort_order ?? 0}
                    onChange={(e) =>
                      setEditingProj((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="proj_summary">Project Scope & Impact Summary</Label>
                <Textarea
                  id="proj_summary"
                  rows={3}
                  value={editingProj?.summary || ''}
                  onChange={(e) => setEditingProj((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Key technical achievements, architectural deliverables, or platform scale reached..."
                />
              </div>

              <div className="space-y-1">
                <Label>Logo Artwork (Optional)</Label>
                <ImageUploader
                  value={editingProj?.logo_image || ''}
                  onChange={(url) => setEditingProj((prev) => ({ ...prev, logo_image: url }))}
                  help="Upload transparent logo or badge artwork."
                  mediaLibraryItems={mediaItems}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingProj?.id ? 'Update Project' : 'Add Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/projects')({
  loader: async () => {
    const [session, otherProjects, mediaItems] = await Promise.all([
      requireAdminSession(),
      adminListOtherProjects(),
      adminListMedia(),
    ]);
    return { session, otherProjects, mediaItems };
  },
  head: () => ({
    meta: [{ title: 'Other Projects | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: ProjectsPage,
});
