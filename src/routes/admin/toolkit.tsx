import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Wrench, Plus, Trash2, Edit2, ExternalLink, Route as RouteIcon } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListToolkits,
  adminSaveToolkit,
  adminDeleteToolkit,
} from '@/lib/cms/landing.functions';
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

interface ToolkitItem {
  id: number;
  title: string;
  tools: string;
  note: string;
  sort_order: number;
}

function ToolkitPage() {
  const { session, toolkits } = Route.useLoaderData();
  const router = useRouter();
  const saveToolkitFn = useServerFn(adminSaveToolkit);
  const deleteToolkitFn = useServerFn(adminDeleteToolkit);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingToolkit, setEditingToolkit] = React.useState<Partial<ToolkitItem> | null>(null);
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditingToolkit({
      title: '',
      tools: '',
      note: '',
      sort_order: (toolkits.length + 1) * 10,
    });
    setDialogOpen(true);
  }

  function openEdit(item: ToolkitItem) {
    setEditingToolkit({ ...item });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingToolkit?.title?.trim()) {
      toast.error('Toolkit category title is required');
      return;
    }

    setBusy(true);
    try {
      await saveToolkitFn({
        data: {
          id: editingToolkit.id,
          title: editingToolkit.title.trim(),
          tools: editingToolkit.tools || '',
          note: editingToolkit.note || '',
          sort_order: Number(editingToolkit.sort_order) || 0,
        },
      });
      await router.invalidate();
      setDialogOpen(false);
      toast.success(editingToolkit.id ? 'Toolkit updated' : 'Toolkit group added');
    } catch {
      toast.error('Failed to save toolkit');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete toolkit group "${title}"?`)) return;
    try {
      await deleteToolkitFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed ${title}`);
    } catch {
      toast.error('Could not delete toolkit');
    }
  }

  return (
    <AdminLayout
      title="Toolkit & Skill Domains"
      description="Manage the 7 technical, product, and leadership domains and software tools displayed in the interactive Toolkit section."
      email={session.email}
      crumbs={[{ label: 'Toolkit' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href="/admin/content/frameworks">
              <RouteIcon className="mr-2 size-4" /> Edit 4-Phase Process
            </a>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add Skill Category
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-5 text-primary" /> Skill & Tool Categories ({toolkits.length})
          </CardTitle>
          <CardDescription>
            Each category displays a badge group with specific software tools, platforms, and methodologies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {toolkits.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No toolkits configured. Click "Add Skill Category" to add one.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {toolkits.map((tk) => {
                const toolsList = tk.tools ? tk.tools.split('\n').filter(Boolean) : [];
                return (
                  <div
                    key={tk.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-foreground">{tk.title}</h3>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          #{tk.sort_order}
                        </span>
                      </div>
                      {tk.note && <p className="mt-1 text-xs text-primary font-medium">{tk.note}</p>}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {toolsList.map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <span className="text-[11px] text-muted-foreground">{toolsList.length} skills listed</span>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(tk)}
                        >
                          <Edit2 className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(tk.id, tk.title)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingToolkit?.id ? 'Edit Skill Category' : 'Add Skill Category'}</DialogTitle>
              <DialogDescription>Define the domain title and list tools/skills line by line.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <div className="space-y-1">
                <Label htmlFor="tk_title">Category Title *</Label>
                <Input
                  id="tk_title"
                  required
                  value={editingToolkit?.title || ''}
                  onChange={(e) => setEditingToolkit((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Product Leadership & Strategy"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tk_note">Context Note (Optional)</Label>
                <Input
                  id="tk_note"
                  value={editingToolkit?.note || ''}
                  onChange={(e) => setEditingToolkit((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="e.g. Core Executive Competency"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tk_tools">Tools & Skills (One per line)</Label>
                <Textarea
                  id="tk_tools"
                  rows={5}
                  value={editingToolkit?.tools || ''}
                  onChange={(e) => setEditingToolkit((prev) => ({ ...prev, tools: e.target.value }))}
                  placeholder="Jira&#10;Linear&#10;Product Discovery&#10;Roadmapping&#10;Figma"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="tk_sort">Display Order</Label>
                <Input
                  id="tk_sort"
                  type="number"
                  value={editingToolkit?.sort_order ?? 0}
                  onChange={(e) =>
                    setEditingToolkit((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingToolkit?.id ? 'Update Category' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/toolkit')({
  loader: async () => {
    const [session, toolkits] = await Promise.all([
      requireAdminSession(),
      adminListToolkits(),
    ]);
    return { session, toolkits };
  },
  head: () => ({
    meta: [{ title: 'Toolkit & Skills | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: ToolkitPage,
});
