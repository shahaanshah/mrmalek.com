import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { BookOpen, ExternalLink, Sliders, Minimize2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminGetHomepage, adminSaveHomepage } from '@/lib/cms/homepage.functions';
import { adminListLandingSections, adminSaveLandingSection } from '@/lib/cms/sections.functions';
import type { LandingSection } from '@/lib/cms/sections.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

function AboutAdminPage() {
  const { session, content, aboutSection } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(adminSaveHomepage);
  const saveSection = useServerFn(adminSaveLandingSection);
  const [busy, setBusy] = React.useState(false);

  const [form, setForm] = React.useState({
    intro_kicker: content.intro_kicker || 'ABOUT',
    intro_title: content.intro_title || 'About Me',
    intro_body: content.intro_body || '',
  });

  const [sectionSettings, setSectionSettings] = React.useState<Partial<LandingSection>>(() => ({
    ...(aboutSection || {
      id: 'about',
      title: 'About Me Intro Paragraph',
      kicker: 'ABOUT',
      main_heading: 'About Me',
      is_enabled: 1,
      is_collapsible: 0,
      default_collapsed: 0,
    }),
  }));

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({ data: form });
      if (sectionSettings.id) {
        await saveSection({
          data: {
            ...aboutSection,
            ...sectionSettings,
            kicker: form.intro_kicker,
            main_heading: form.intro_title,
          } as LandingSection,
        });
      }
      await router.invalidate();
      toast.success('About Me narrative and section visibility saved successfully!');
    } catch {
      toast.error('Could not save About Me narrative.');
    } finally {
      setBusy(false);
    }
  }

  const paragraphs = form.intro_body.split('\n\n').filter(Boolean);

  return (
    <AdminLayout
      title="About Me Narrative"
      description="Manage the personal background, career journey, and executive philosophy story rendered on the landing page."
      email={session.email}
      crumbs={[{ label: 'About Me' }]}
      actions={
        <Button asChild variant="outline">
          <a href="/#about" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" /> Preview On Live Site
          </a>
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5 text-primary" /> Narrative Content
            </CardTitle>
            <CardDescription>
              Write in an authentic, conversational first-person tone. Separate paragraphs with a blank line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="intro_kicker">Section Badge / Kicker</Label>
                <Input
                  id="intro_kicker"
                  value={form.intro_kicker}
                  onChange={(e) => updateField('intro_kicker', e.target.value)}
                  placeholder="ABOUT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="intro_title">Main Heading</Label>
                <Input
                  id="intro_title"
                  value={form.intro_title}
                  onChange={(e) => updateField('intro_title', e.target.value)}
                  placeholder="About Me"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="intro_body">Executive Story &amp; Career Narrative</Label>
                <span className="text-xs text-muted-foreground">{paragraphs.length} paragraphs</span>
              </div>
              <Textarea
                id="intro_body"
                rows={14}
                value={form.intro_body}
                onChange={(e) => updateField('intro_body', e.target.value)}
                placeholder="I started at Dopravo in Riyadh...&#10;&#10;On the education side...&#10;&#10;These days I'm based in Ottawa..."
                className="font-sans leading-relaxed text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Press Enter twice between paragraphs to create clean paragraph spacing.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section Visibility & Collapsible Controls */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="size-5 text-primary" /> Landing Page Visibility &amp; Collapsible Settings
            </CardTitle>
            <CardDescription>
              Control whether this section appears on the landing page, and whether visitors can expand/collapse it to reduce page length.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
              <div>
                <Label className="text-sm font-semibold">Section Visibility on Landing Page</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  When enabled, this About Me section renders on the live homepage. When disabled, it is completely hidden.
                </p>
              </div>
              <Switch
                checked={Boolean(sectionSettings.is_enabled !== 0)}
                onCheckedChange={(checked) =>
                  setSectionSettings((prev) => ({ ...prev, is_enabled: checked ? 1 : 0 }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
              <div>
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Minimize2 className="size-3.5 text-primary" /> Make Section Collapsible on Landing Page
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Allows website visitors to collapse the narrative into a compact summary card to reduce page length.
                </p>
              </div>
              <Switch
                checked={Boolean(sectionSettings.is_collapsible)}
                onCheckedChange={(checked) =>
                  setSectionSettings((prev) => ({ ...prev, is_collapsible: checked ? 1 : 0 }))
                }
              />
            </div>

            {Boolean(sectionSettings.is_collapsible) && (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 p-4 bg-primary/5 ml-3">
                <div>
                  <Label className="text-sm font-semibold">Collapsed by Default on Page Load</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Start this section collapsed on initial page load with a button for visitors to expand it.
                  </p>
                </div>
                <Switch
                  checked={Boolean(sectionSettings.default_collapsed)}
                  onCheckedChange={(checked) =>
                    setSectionSettings((prev) => ({ ...prev, default_collapsed: checked ? 1 : 0 }))
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Saving...' : 'Save Narrative & Section Settings'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/about')({
  loader: async () => {
    const [session, content, sections] = await Promise.all([
      requireAdminSession(),
      adminGetHomepage(),
      adminListLandingSections(),
    ]);
    const aboutSection = sections.find((s) => s.id === 'about') || null;
    return { session, content, aboutSection };
  },
  head: () => ({
    meta: [
      { title: 'About Me Narrative | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AboutAdminPage,
});
