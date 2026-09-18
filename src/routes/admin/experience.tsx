import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Briefcase, Plus, Trash2, Edit2, ExternalLink, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListExperiences,
  adminSaveExperience,
  adminDeleteExperience,
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

interface ExperienceItem {
  id: number;
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  badge?: string | null;
  description: string;
  impact?: string | null;
  achievements: string;
  skills: string;
  sort_order: number;
}

function ExperiencePage() {
  const { session, experiences } = Route.useLoaderData();
  const router = useRouter();
  const saveExpFn = useServerFn(adminSaveExperience);
  const deleteExpFn = useServerFn(adminDeleteExperience);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingExp, setEditingExp] = React.useState<Partial<ExperienceItem> | null>(null);
  const [busy, setBusy] = React.useState(false);

  function openCreate() {
    setEditingExp({
      role: '',
      company: '',
      location: 'Ottawa, Canada',
      period: '2024 - Present',
      type: 'Full-time',
      badge: '',
      description: '',
      impact: '',
      achievements: '',
      skills: '',
      sort_order: (experiences.length + 1) * 10,
    });
    setDialogOpen(true);
  }

  function openEdit(item: ExperienceItem) {
    setEditingExp({ ...item });
    setDialogOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingExp?.role?.trim() || !editingExp?.company?.trim()) {
      toast.error('Role and Company are required');
      return;
    }

    setBusy(true);
    try {
      await saveExpFn({
        data: {
          id: editingExp.id,
          role: editingExp.role.trim(),
          company: editingExp.company.trim(),
          location: editingExp.location || '',
          period: editingExp.period || '',
          type: editingExp.type || 'Full-time',
          badge: editingExp.badge?.trim() || null,
          description: editingExp.description || '',
          impact: editingExp.impact?.trim() || null,
          achievements: editingExp.achievements || '',
          skills: editingExp.skills || '',
          sort_order: Number(editingExp.sort_order) || 0,
        },
      });
      await router.invalidate();
      setDialogOpen(false);
      toast.success(editingExp.id ? 'Experience updated' : 'Role added to timeline');
    } catch {
      toast.error('Failed to save experience');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number, role: string, company: string) {
    if (!confirm(`Are you sure you want to remove "${role} at ${company}"?`)) return;

    try {
      await deleteExpFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed ${role}`);
    } catch {
      toast.error('Could not delete experience');
    }
  }

  return (
    <AdminLayout
      title="Career Experience Timeline"
      description="Manage the leadership roles, deliverables, measurable business impact, and skills showcased in the Career Matrix."
      email={session.email}
      crumbs={[{ label: 'Career Experience' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 size-4" /> Live Preview
            </a>
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" /> Add Timeline Role
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5 text-primary" /> Career Roles ({experiences.length})
          </CardTitle>
          <CardDescription>
            Displayed in chronological sequence with expandable details on mobile and interactive hover metrics on desktop.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No experience entries found. Click "Add Timeline Role" to create one.
            </div>
          ) : (
            experiences.map((exp) => {
              const bullets = exp.achievements ? exp.achievements.split('\n').filter(Boolean) : [];
              const skills = exp.skills ? exp.skills.split('\n').filter(Boolean) : [];

              return (
                <div
                  key={exp.id}
                  className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{exp.role}</h3>
                        <span className="text-sm font-semibold text-primary">@ {exp.company}</span>
                        {exp.badge && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {exp.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" /> {exp.period}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" /> {exp.location}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5">{exp.type}</span>
                        <span>Order #{exp.sort_order}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(exp)}
                      >
                        <Edit2 className="mr-1.5 size-3.5" /> Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(exp.id, exp.role, exp.company)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {exp.description && (
                    <p className="mt-3 text-sm text-muted-foreground">{exp.description}</p>
                  )}

                  {exp.impact && (
                    <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>{exp.impact}</span>
                    </div>
                  )}

                  {bullets.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Key Achievements:
                      </p>
                      <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                        {bullets.map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 pt-2">
                      {skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingExp?.id ? 'Edit Career Role' : 'Add Career Role'}</DialogTitle>
              <DialogDescription>
                Fill out the role information, business impact metrics, and key deliverable bullet points.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="exp_role">Role Title *</Label>
                  <Input
                    id="exp_role"
                    required
                    value={editingExp?.role || ''}
                    onChange={(e) => setEditingExp((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Head of Product"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_company">Company / Organization *</Label>
                  <Input
                    id="exp_company"
                    required
                    value={editingExp?.company || ''}
                    onChange={(e) => setEditingExp((prev) => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. Qawafel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="exp_period">Timeframe</Label>
                  <Input
                    id="exp_period"
                    value={editingExp?.period || ''}
                    onChange={(e) => setEditingExp((prev) => ({ ...prev, period: e.target.value }))}
                    placeholder="e.g. 2021 – 2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_location">Location</Label>
                  <Input
                    id="exp_location"
                    value={editingExp?.location || ''}
                    onChange={(e) => setEditingExp((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Riyadh, KSA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_sort">Display Order</Label>
                  <Input
                    id="exp_sort"
                    type="number"
                    value={editingExp?.sort_order ?? 0}
                    onChange={(e) =>
                      setEditingExp((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="exp_type">Employment Type</Label>
                  <Input
                    id="exp_type"
                    value={editingExp?.type || ''}
                    onChange={(e) => setEditingExp((prev) => ({ ...prev, type: e.target.value }))}
                    placeholder="Full-time, Advisory, Contract"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp_badge">Highlight Badge (Optional)</Label>
                  <Input
                    id="exp_badge"
                    value={editingExp?.badge || ''}
                    onChange={(e) => setEditingExp((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Current Venture, Featured"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp_impact">Headline Impact Metric</Label>
                <Input
                  id="exp_impact"
                  value={editingExp?.impact || ''}
                  onChange={(e) => setEditingExp((prev) => ({ ...prev, impact: e.target.value }))}
                  placeholder="e.g. Scaled platform from $0 to $30M+ GMV across 1,200+ merchants"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp_description">Summary Description</Label>
                <Textarea
                  id="exp_description"
                  rows={2}
                  value={editingExp?.description || ''}
                  onChange={(e) => setEditingExp((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Strategic scope and responsibilities..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp_achievements">
                  Key Achievements & Responsibilities (One bullet per line)
                </Label>
                <Textarea
                  id="exp_achievements"
                  rows={4}
                  value={editingExp?.achievements || ''}
                  onChange={(e) => setEditingExp((prev) => ({ ...prev, achievements: e.target.value }))}
                  placeholder="Led cross-functional team of 14 engineers and designers&#10;Decreased onboarding drop-off by 38%&#10;Integrated enterprise payment rails"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp_skills">Skills / Domains (One per line)</Label>
                <Textarea
                  id="exp_skills"
                  rows={3}
                  value={editingExp?.skills || ''}
                  onChange={(e) => setEditingExp((prev) => ({ ...prev, skills: e.target.value }))}
                  placeholder="Product Strategy&#10;Microservices Architecture&#10;B2B Payments"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingExp?.id ? 'Update Role' : 'Add Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/experience')({
  loader: async () => {
    const [session, experiences] = await Promise.all([
      requireAdminSession(),
      adminListExperiences(),
    ]);
    return { session, experiences };
  },
  head: () => ({
    meta: [{ title: 'Career Experience | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: ExperiencePage,
});
