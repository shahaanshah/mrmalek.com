import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import {
  Layers,
  ExternalLink,
  Briefcase,
  Route as RouteIcon,
  Video,
  Wrench,
  GraduationCap,
  Rocket,
  Quote,
  Mail,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminGetHomepage, adminSaveHomepage } from '@/lib/cms/homepage.functions';
import { HomepageContent, HomepageKey, homepageSchema } from '@/lib/cms/homepage.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SectionConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  kickerKey: HomepageKey;
  titleKey: HomepageKey;
  highlightKey?: HomepageKey;
  subtitleKey: HomepageKey;
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'cases',
    title: 'Featured Case Studies Section',
    description: 'Header text above the interactive case studies slider and proof matrix.',
    icon: Briefcase,
    kickerKey: 'work_kicker',
    titleKey: 'work_title',
    highlightKey: 'work_highlight',
    subtitleKey: 'work_subtitle',
  },
  {
    id: 'process',
    title: 'How I Work (4-Phase Process) Section',
    description: 'Header text above the 4 delivery phases: Discover, Define, Execute, Optimize.',
    icon: RouteIcon,
    kickerKey: 'process_kicker',
    titleKey: 'process_title',
    highlightKey: 'process_highlight',
    subtitleKey: 'process_subtitle',
  },
  {
    id: 'videos',
    title: 'PM Talks & Video Breakdowns Section',
    description: 'Header text above the video podcast episodes and breakdown carousel.',
    icon: Video,
    kickerKey: 'pmtalks_kicker',
    titleKey: 'pmtalks_title',
    highlightKey: 'pmtalks_highlight',
    subtitleKey: 'pmtalks_subtitle',
  },
  {
    id: 'toolkit',
    title: 'Technical Toolkit & Skills Section',
    description: 'Header text above the software tools, methodologies, and technical stack badges.',
    icon: Wrench,
    kickerKey: 'toolkit_kicker',
    titleKey: 'toolkit_title',
    highlightKey: 'toolkit_highlight',
    subtitleKey: 'toolkit_subtitle',
  },
  {
    id: 'history',
    title: 'Career Experience & Credentials Section',
    description: 'Header text above the career timeline, education, and professional certifications.',
    icon: GraduationCap,
    kickerKey: 'history_kicker',
    titleKey: 'history_title',
    highlightKey: 'history_highlight',
    subtitleKey: 'history_subtitle',
  },
  {
    id: 'ventures',
    title: 'Outside Client Work (Ventures) Section',
    description: 'Header text above personal software ventures and side businesses.',
    icon: Rocket,
    kickerKey: 'ventures_kicker',
    titleKey: 'ventures_title',
    highlightKey: 'ventures_highlight',
    subtitleKey: 'ventures_subtitle',
  },
  {
    id: 'testimonials',
    title: 'Testimonials & Social Proof Section',
    description: 'Header text above leadership endorsements and recommendations.',
    icon: Quote,
    kickerKey: 'testimonials_kicker',
    titleKey: 'testimonials_title',
    highlightKey: 'testimonials_highlight',
    subtitleKey: 'testimonials_subtitle',
  },
  {
    id: 'contact',
    title: 'Direct Inquiries & Contact Section',
    description: 'Header text above consultation booking and direct contact channels.',
    icon: Mail,
    kickerKey: 'contact_kicker',
    titleKey: 'contact_title',
    highlightKey: 'contact_highlight',
    subtitleKey: 'contact_subtitle',
  },
];

function SectionsAdminPage() {
  const { session, content } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(adminSaveHomepage);
  const [busy, setBusy] = React.useState(false);

  const [form, setForm] = React.useState<HomepageContent>(() => ({ ...content }));

  function updateField(key: HomepageKey, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = homepageSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the input values');
      return;
    }
    setBusy(true);
    try {
      await save({ data: parsed.data });
      await router.invalidate();
      toast.success('Section headings and intros saved successfully!');
    } catch {
      toast.error('Could not save section headings.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout
      title="Section Headings &amp; Intros"
      description="Manage the title, badge kicker, highlighted text, and introductory descriptions for each section of the landing page."
      email={session.email}
      crumbs={[{ label: 'Section Headings' }]}
      actions={
        <Button asChild variant="outline">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" /> Preview Live Site
          </a>
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {SECTIONS.map((sec) => (
            <Card key={sec.id} className="border-border/80 shadow-sm flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <sec.icon className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{sec.title}</CardTitle>
                      <CardDescription className="text-xs">{sec.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Badge Kicker</Label>
                    <Input
                      value={form[sec.kickerKey] ?? ''}
                      onChange={(e) => updateField(sec.kickerKey, e.target.value)}
                      placeholder="e.g. FEATURED WORK"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Main Heading</Label>
                      <Input
                        value={form[sec.titleKey] ?? ''}
                        onChange={(e) => updateField(sec.titleKey, e.target.value)}
                        placeholder="e.g. Case Studies &"
                        className="text-xs font-medium"
                      />
                    </div>

                    {sec.highlightKey && (
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Highlighted Text (Gradient)</Label>
                        <Input
                          value={form[sec.highlightKey] ?? ''}
                          onChange={(e) => updateField(sec.highlightKey!, e.target.value)}
                          placeholder="e.g. Real Results"
                          className="text-xs text-primary font-medium"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Introductory Subtitle</Label>
                    <Textarea
                      rows={2}
                      value={form[sec.subtitleKey] ?? ''}
                      onChange={(e) => updateField(sec.subtitleKey, e.target.value)}
                      placeholder="Introductory sentence underneath the heading..."
                      className="text-xs"
                    />
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Sticky Save Bar */}
        <div className="sticky bottom-0 flex justify-end border-t bg-background/95 py-3 backdrop-blur z-20">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Saving...' : 'Save All Section Headings'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/sections')({
  loader: async () => {
    const [session, content] = await Promise.all([
      requireAdminSession(),
      adminGetHomepage(),
    ]);
    return { session, content };
  },
  head: () => ({
    meta: [
      { title: 'Section Headings & Intros | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SectionsAdminPage,
});
