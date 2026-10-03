import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Sparkles, Image as ImageIcon, BarChart3, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminGetHomepage, adminSaveHomepage } from '@/lib/cms/homepage.functions';
import { adminListMedia } from '@/lib/cms/content.functions';
import {
  HomepageContent,
  HomepageKey,
  homepageSchema,
  parseHeroMetrics,
  HeroMetric,
} from '@/lib/cms/homepage.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function HomepagePage() {
  const { session, content, mediaItems } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(adminSaveHomepage);
  const [busy, setBusy] = React.useState(false);

  // Form state
  const [formValues, setFormValues] = React.useState<HomepageContent>(() => ({ ...content }));

  function updateField(key: HomepageKey, value: string) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  // Structured metrics state initialized from serialized string
  const [metrics, setMetrics] = React.useState<HeroMetric[]>(() => {
    const parsed = parseHeroMetrics(content.hero_metrics || '');
    const defaultMetrics: HeroMetric[] = [
      { value: '8+', label: 'Years Product Delivery', sub: 'SaaS, FinTech & Enterprise' },
      { value: '20+', label: 'Digital Products Shipped', sub: 'From Strategy to Launch' },
      { value: '10+', label: 'Enterprise & Venture Brands', sub: 'North America & MENA' },
      { value: '$50M+', label: 'GMV & Pipeline Handled', sub: 'High-Volume Systems' },
    ];
    return [
      parsed[0] || defaultMetrics[0],
      parsed[1] || defaultMetrics[1],
      parsed[2] || defaultMetrics[2],
      parsed[3] || defaultMetrics[3],
    ];
  });

  function updateMetric(index: number, field: keyof HeroMetric, value: string) {
    setMetrics((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Serialize structured metrics into pipe format for the landing page adapter
    const serializedMetrics = metrics
      .map((m) => `${m.value.trim()} | ${m.label.trim()} | ${m.sub.trim()}`)
      .join('\n');

    const updatedPayload: HomepageContent = {
      ...formValues,
      hero_metrics: serializedMetrics,
    };

    const parsed = homepageSchema.safeParse(updatedPayload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the input values');
      return;
    }

    setBusy(true);
    try {
      await save({ data: parsed.data });
      await router.invalidate();
      toast.success('Hero section and portrait saved successfully!');
    } catch {
      toast.error('Could not save hero content.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout
      title="Hero Section & Portrait"
      description="Manage the main hero headlines, portrait photo, authority call-to-actions, and the 4 highlight metrics."
      email={session.email}
      crumbs={[{ label: 'Hero & Portrait' }]}
      actions={
        <Button asChild variant="outline">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" /> Preview Live Site
          </a>
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* HERO COPY CARD */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" /> Hero Headlines &amp; Positioning
            </CardTitle>
            <CardDescription>
              The first impression above the fold: badge kicker, main value proposition, and call-to-action buttons.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero_eyebrow">Eyebrow Badge Kicker</Label>
                <Input
                  id="hero_eyebrow"
                  value={formValues.hero_eyebrow}
                  onChange={(e) => updateField('hero_eyebrow', e.target.value)}
                  placeholder="MALEK HUSSEIN • PRODUCT LEADER & BUILDER"
                />
                <p className="text-[11px] text-muted-foreground">
                  Text displayed in the hero kicker badge. For advanced styling (font, custom colors, icon/logo, visibility), manage it in{' '}
                  <a href="/admin/sections" className="text-primary underline font-medium">
                    Section Headings Customizer
                  </a>.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_highlight">Highlighted Ending (Purple Gradient Text)</Label>
                <Input
                  id="hero_highlight"
                  value={formValues.hero_highlight}
                  onChange={(e) => updateField('hero_highlight', e.target.value)}
                  placeholder="turn ideas into revenue."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_title">Main Headline</Label>
              <Textarea
                id="hero_title"
                rows={2}
                value={formValues.hero_title}
                onChange={(e) => updateField('hero_title', e.target.value)}
                placeholder="I build digital products, businesses, and systems that"
              />
              <p className="text-xs text-muted-foreground">
                The main headline before the highlighted ending phrase.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hero_subtitle">Supporting Narrative Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                rows={3}
                value={formValues.hero_subtitle}
                onChange={(e) => updateField('hero_subtitle', e.target.value)}
                placeholder="Bridging technical engineering with commercial strategy to ship revenue-generating software..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero_cta_primary">Primary Button CTA</Label>
                <Input
                  id="hero_cta_primary"
                  value={formValues.hero_cta_primary}
                  onChange={(e) => updateField('hero_cta_primary', e.target.value)}
                  placeholder="View My Work"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_cta_secondary">Secondary Button CTA</Label>
                <Input
                  id="hero_cta_secondary"
                  value={formValues.hero_cta_secondary}
                  onChange={(e) => updateField('hero_cta_secondary', e.target.value)}
                  placeholder="Let's Talk"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HERO PORTRAIT IMAGE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-5 text-primary" /> Hero Portrait Photo
            </CardTitle>
            <CardDescription>
              High-resolution portrait shown prominently on the hero card. Upload a new photo or select from your Media Library.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-xl">
            <ImageUploader
              id="hero_image"
              label="Portrait Image"
              value={formValues.hero_image}
              onChange={(url) => updateField('hero_image', url)}
              help="Recommended: Transparent PNG or crisp portrait with dark backdrop. Min resolution 600×600px."
              mediaLibraryItems={mediaItems}
            />
          </CardContent>
        </Card>

        {/* STRUCTURED 4 HERO METRICS HIGHLIGHTS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" /> Hero Metrics Strip (4 Highlights)
            </CardTitle>
            <CardDescription>
              The four key career authority numbers displayed directly beneath the hero headline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Highlight #{idx + 1}
                    </span>
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Metric Value</Label>
                    <Input
                      value={item.value}
                      onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                      placeholder="e.g. 8+, $50M+, 20+"
                      className="font-bold text-base"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Main Label</Label>
                    <Input
                      value={item.label}
                      onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                      placeholder="e.g. Years Product Delivery"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Domain / Detail Note</Label>
                    <Input
                      value={item.sub}
                      onChange={(e) => updateMetric(idx, 'sub', e.target.value)}
                      placeholder="e.g. SaaS, FinTech & Enterprise"
                      className="text-xs text-muted-foreground"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Visual Preview of Metric Badges */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Live Strip Preview (As rendered on landing page)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {metrics.map((m, idx) => (
                  <div key={idx} className="rounded-lg border border-border/40 bg-card/60 p-3 text-center">
                    <p className="text-xl font-extrabold text-foreground">{m.value || '0'}</p>
                    <p className="text-xs font-medium text-foreground/90 mt-0.5">{m.label || 'Metric'}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.sub || 'Detail note'}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STICKY BOTTOM SAVE BAR */}
        <div className="sticky bottom-0 flex justify-end border-t bg-background/95 py-3 backdrop-blur z-20">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Saving Hero...' : 'Save Hero Section'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/homepage')({
  loader: async () => {
    const [session, content, mediaItems] = await Promise.all([
      requireAdminSession(),
      adminGetHomepage(),
      adminListMedia(),
    ]);
    return { session, content, mediaItems };
  },
  head: () => ({
    meta: [
      { title: 'Hero & Portrait | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: HomepagePage,
});
