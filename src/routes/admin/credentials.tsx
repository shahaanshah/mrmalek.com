import * as React from 'react';
import { createFileRoute, useRouter, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { GraduationCap, Award, Plus, Trash2, Edit2, ExternalLink, FileDown } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListCredentials,
  adminSaveEducation,
  adminDeleteEducation,
  adminSaveCertification,
  adminDeleteCertification,
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

interface EducationItem {
  id: number;
  degree: string;
  institution: string;
  location: string;
  year: string;
  details: string;
  sort_order: number;
}

interface CertificationItem {
  id: number;
  name: string;
  issuer: string;
  year: string;
  credential_id?: string | null;
  sort_order: number;
}

function CredentialsPage() {
  const { session, credentials } = Route.useLoaderData();
  const router = useRouter();

  const saveEduFn = useServerFn(adminSaveEducation);
  const deleteEduFn = useServerFn(adminDeleteEducation);
  const saveCertFn = useServerFn(adminSaveCertification);
  const deleteCertFn = useServerFn(adminDeleteCertification);

  // Education dialog
  const [eduOpen, setEduOpen] = React.useState(false);
  const [editingEdu, setEditingEdu] = React.useState<Partial<EducationItem> | null>(null);

  // Cert dialog
  const [certOpen, setCertOpen] = React.useState(false);
  const [editingCert, setEditingCert] = React.useState<Partial<CertificationItem> | null>(null);

  const [busy, setBusy] = React.useState(false);

  function openCreateEdu() {
    setEditingEdu({
      degree: '',
      institution: '',
      location: '',
      year: '',
      details: '',
      sort_order: (credentials.education.length + 1) * 10,
    });
    setEduOpen(true);
  }

  function openEditEdu(item: EducationItem) {
    setEditingEdu({ ...item });
    setEduOpen(true);
  }

  async function handleSaveEdu(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEdu?.degree?.trim() || !editingEdu?.institution?.trim()) {
      toast.error('Degree and Institution are required');
      return;
    }

    setBusy(true);
    try {
      await saveEduFn({
        data: {
          id: editingEdu.id,
          degree: editingEdu.degree.trim(),
          institution: editingEdu.institution.trim(),
          location: editingEdu.location || '',
          year: editingEdu.year || '',
          details: editingEdu.details || '',
          sort_order: Number(editingEdu.sort_order) || 0,
        },
      });
      await router.invalidate();
      setEduOpen(false);
      toast.success(editingEdu.id ? 'Degree updated' : 'Degree added');
    } catch {
      toast.error('Failed to save degree');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteEdu(id: number, degree: string) {
    if (!confirm(`Delete degree "${degree}"?`)) return;
    try {
      await deleteEduFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed ${degree}`);
    } catch {
      toast.error('Could not delete degree');
    }
  }

  function openCreateCert() {
    setEditingCert({
      name: '',
      issuer: '',
      year: 'Certified',
      credential_id: '',
      sort_order: (credentials.certifications.length + 1) * 10,
    });
    setCertOpen(true);
  }

  function openEditCert(item: CertificationItem) {
    setEditingCert({ ...item });
    setCertOpen(true);
  }

  async function handleSaveCert(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCert?.name?.trim() || !editingCert?.issuer?.trim()) {
      toast.error('Certification name and Issuer are required');
      return;
    }

    setBusy(true);
    try {
      await saveCertFn({
        data: {
          id: editingCert.id,
          name: editingCert.name.trim(),
          issuer: editingCert.issuer.trim(),
          year: editingCert.year || 'Certified',
          credential_id: editingCert.credential_id?.trim() || null,
          sort_order: Number(editingCert.sort_order) || 0,
        },
      });
      await router.invalidate();
      setCertOpen(false);
      toast.success(editingCert.id ? 'Certification updated' : 'Certification added');
    } catch {
      toast.error('Failed to save certification');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCert(id: number, name: string) {
    if (!confirm(`Delete certification "${name}"?`)) return;
    try {
      await deleteCertFn({ data: { id } });
      await router.invalidate();
      toast.success(`Removed ${name}`);
    } catch {
      toast.error('Could not delete certification');
    }
  }

  return (
    <AdminLayout
      title="Credentials & Education"
      description="Manage academic degrees, universities, and verified industry professional certifications."
      email={session.email}
      crumbs={[{ label: 'Credentials' }]}
      actions={
        <Button asChild variant="outline">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" /> Live Preview
          </a>
        </Button>
      }
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* ACADEMIC DEGREES */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="size-5 text-primary" /> Degrees & Diplomas ({credentials.education.length})
              </CardTitle>
              <CardDescription>Academic programs, master's degrees, and postgrad certificates.</CardDescription>
            </div>
            <Button size="sm" onClick={openCreateEdu}>
              <Plus className="mr-1.5 size-3.5" /> Add Degree
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {credentials.education.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No degrees added yet.</p>
            ) : (
              credentials.education.map((edu) => (
                <div
                  key={edu.id}
                  className="flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 transition-all hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm">{edu.degree}</h4>
                      <p className="text-xs font-medium text-primary">{edu.institution}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {edu.year} • {edu.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditEdu(edu)}
                      >
                        <Edit2 className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteEdu(edu.id, edu.degree)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                  {edu.details && (
                    <p className="mt-2 text-xs text-muted-foreground border-t pt-2">{edu.details}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* INDUSTRY CERTIFICATIONS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="size-5 text-primary" /> Industry Certifications ({credentials.certifications.length})
              </CardTitle>
              <CardDescription>Professional credentials, agile badges, and cloud certs.</CardDescription>
            </div>
            <Button size="sm" onClick={openCreateCert}>
              <Plus className="mr-1.5 size-3.5" /> Add Cert
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {credentials.certifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No certifications added yet.</p>
            ) : (
              credentials.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5 transition-all hover:border-primary/40"
                >
                  <div>
                    <h4 className="font-semibold text-sm">{cert.name}</h4>
                    <p className="text-xs font-medium text-muted-foreground">
                      {cert.issuer} • <span className="text-primary">{cert.year}</span>
                    </p>
                    {cert.credential_id && (
                      <p className="text-[10px] font-mono text-muted-foreground">ID: {cert.credential_id}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditCert(cert)}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteCert(cert.id, cert.name)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* CV DOWNLOAD BANNER NOTICE */}
      <div className="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <FileDown className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Official CV Download Banner Location</h4>
            <p className="text-xs text-muted-foreground">
              The official Executive CV Download Banner is rendered directly below this Education &amp; Certifications section on the landing page.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 border-purple-500/30 hover:bg-purple-500/10">
          <Link to="/admin/sections">
            <span>Edit Banner Copy</span>
            <ExternalLink className="size-3" />
          </Link>
        </Button>
      </div>

      {/* EDUCATION DIALOG */}
      <Dialog open={eduOpen} onOpenChange={setEduOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveEdu}>
            <DialogHeader>
              <DialogTitle>{editingEdu?.id ? 'Edit Academic Degree' : 'Add Degree / Diploma'}</DialogTitle>
              <DialogDescription>Enter institution details and focus areas.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="space-y-1">
                <Label htmlFor="edu_degree">Degree Title *</Label>
                <Input
                  id="edu_degree"
                  required
                  value={editingEdu?.degree || ''}
                  onChange={(e) => setEditingEdu((prev) => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g. Master of Science in Info Management"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edu_inst">Institution / University *</Label>
                <Input
                  id="edu_inst"
                  required
                  value={editingEdu?.institution || ''}
                  onChange={(e) => setEditingEdu((prev) => ({ ...prev, institution: e.target.value }))}
                  placeholder="e.g. Syracuse University"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="edu_year">Years Attended</Label>
                  <Input
                    id="edu_year"
                    value={editingEdu?.year || ''}
                    onChange={(e) => setEditingEdu((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. 2018 - 2020"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edu_loc">Campus Location</Label>
                  <Input
                    id="edu_loc"
                    value={editingEdu?.location || ''}
                    onChange={(e) => setEditingEdu((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. New York, USA"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edu_details">Program Highlights / Focus</Label>
                <Textarea
                  id="edu_details"
                  rows={2}
                  value={editingEdu?.details || ''}
                  onChange={(e) => setEditingEdu((prev) => ({ ...prev, details: e.target.value }))}
                  placeholder="Focus on enterprise IT architectures and agile management."
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edu_sort">Display Order</Label>
                <Input
                  id="edu_sort"
                  type="number"
                  value={editingEdu?.sort_order ?? 0}
                  onChange={(e) =>
                    setEditingEdu((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEduOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingEdu?.id ? 'Update Degree' : 'Add Degree'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CERTIFICATION DIALOG */}
      <Dialog open={certOpen} onOpenChange={setCertOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveCert}>
            <DialogHeader>
              <DialogTitle>{editingCert?.id ? 'Edit Certification' : 'Add Industry Certification'}</DialogTitle>
              <DialogDescription>Enter the certificate body, status, and verification ID.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <div className="space-y-1">
                <Label htmlFor="cert_name">Certification Title *</Label>
                <Input
                  id="cert_name"
                  required
                  value={editingCert?.name || ''}
                  onChange={(e) => setEditingCert((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. PMP® - Project Management Professional"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cert_issuer">Issuing Organization *</Label>
                <Input
                  id="cert_issuer"
                  required
                  value={editingCert?.issuer || ''}
                  onChange={(e) => setEditingCert((prev) => ({ ...prev, issuer: e.target.value }))}
                  placeholder="e.g. Project Management Institute (PMI)"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="cert_year">Status / Year</Label>
                  <Input
                    id="cert_year"
                    value={editingCert?.year || ''}
                    onChange={(e) => setEditingCert((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. Active, 2023"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cert_sort">Display Order</Label>
                  <Input
                    id="cert_sort"
                    type="number"
                    value={editingCert?.sort_order ?? 0}
                    onChange={(e) =>
                      setEditingCert((prev) => ({ ...prev, sort_order: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cert_cred">Credential ID (Optional)</Label>
                <Input
                  id="cert_cred"
                  value={editingCert?.credential_id || ''}
                  onChange={(e) => setEditingCert((prev) => ({ ...prev, credential_id: e.target.value }))}
                  placeholder="e.g. PMI-1928472"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCertOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving...' : editingCert?.id ? 'Update Certification' : 'Add Certification'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/credentials')({
  loader: async () => {
    const [session, credentials] = await Promise.all([
      requireAdminSession(),
      adminListCredentials(),
    ]);
    return { session, credentials };
  },
  head: () => ({
    meta: [{ title: 'Credentials | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: CredentialsPage,
});
