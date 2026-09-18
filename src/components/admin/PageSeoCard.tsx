import * as React from 'react';
import { toast } from 'sonner';
import { useServerFn } from '@tanstack/react-start';
import {
  Search,
  Share2,
  Globe,
  Smartphone,
  Monitor,
  Sparkles,
  ExternalLink,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminSavePageSeo } from '@/lib/cms/content.functions';
import type { SeoMeta } from '@/lib/cms/content.types';
import type { PageSeoRoute } from '@/lib/cms/pageSeo';

type Draft = {
  seo_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
};

function toDraft(seo: SeoMeta | null | undefined): Draft {
  return {
    seo_title: seo?.seo_title ?? '',
    meta_description: seo?.meta_description ?? '',
    og_title: seo?.og_title ?? '',
    og_description: seo?.og_description ?? '',
    og_image: seo?.og_image ?? '',
  };
}

export default function PageSeoCard({
  route,
  seo,
  onSaved,
}: {
  route: PageSeoRoute;
  seo: SeoMeta | null | undefined;
  onSaved: () => Promise<unknown> | void;
}) {
  const [draft, setDraft] = React.useState<Draft>(() => toDraft(seo));
  const [saving, setSaving] = React.useState(false);
  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const save = useServerFn(adminSavePageSeo);

  const set = (key: keyof Draft) => (value: string) => setDraft((d) => ({ ...d, [key]: value }));

  const effectiveTitle = draft.seo_title.trim() || route.defaults.title;
  const effectiveDescription = draft.meta_description.trim() || route.defaults.description;
  const effectiveOgTitle = draft.og_title.trim() || effectiveTitle;
  const effectiveOgDescription = draft.og_description.trim() || effectiveDescription;
  const effectiveOgImage = draft.og_image.trim() || route.defaults.ogImage || '/images/og-preview.png';

  // Character count guidelines (WordPress Yoast / RankMath standards)
  const titleCount = effectiveTitle.length;
  const titleStatus = titleCount >= 40 && titleCount <= 60 ? 'optimal' : titleCount < 40 ? 'short' : 'long';
  const descCount = effectiveDescription.length;
  const descStatus = descCount >= 120 && descCount <= 160 ? 'optimal' : descCount < 120 ? 'short' : 'long';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await save({
        data: {
          path: route.path,
          seo_title: draft.seo_title,
          meta_description: draft.meta_description,
          og_title: draft.og_title,
          og_description: draft.og_description,
          og_image: draft.og_image,
          canonical_url: '',
          no_index: false,
          no_follow: false,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await onSaved();
      toast.success('SEO & Social Share metadata saved successfully');
    } catch {
      toast.error('Could not save SEO metadata right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* LEFT COLUMN: LIVE WORDPRESS-STYLE PREVIEWS */}
      <div className="space-y-6 lg:col-span-6">
        {/* GOOGLE SEARCH SNIPPET PREVIEW */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Search className="size-4 text-primary" /> Google Search Snippet Preview
              </CardTitle>
              <div className="flex items-center rounded-md border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                    previewDevice === 'desktop' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Monitor className="size-3" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                    previewDevice === 'mobile' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Smartphone className="size-3" /> Mobile
                </button>
              </div>
            </div>
            <CardDescription className="text-xs">
              Live simulation of how your portfolio appears in Google search engine result pages (SERP).
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <div
              className={`rounded-xl border border-border/70 bg-[#ffffff] text-[#202124] p-4 font-sans shadow-sm dark:bg-[#202124] dark:text-[#e8eaed] ${
                previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
              }`}
            >
              {/* Google Result Header / Favicon & URL */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  M
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-[13px] font-medium text-[#202124] dark:text-[#dadce0] truncate">
                    mrmalek.com
                  </div>
                  <div className="text-[11px] text-[#5f6368] dark:text-[#bdc1c6] truncate">
                    https://mrmalek.com
                  </div>
                </div>
              </div>

              {/* Google Clickable Blue Title */}
              <h3 className="text-[18px] sm:text-[20px] font-normal leading-[1.3] text-[#1a0dab] hover:underline cursor-pointer dark:text-[#8ab4f8] mb-1.5">
                {effectiveTitle}
              </h3>

              {/* Google Snippet Description */}
              <p className="text-[13px] sm:text-[14px] leading-[1.5] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-3">
                {effectiveDescription}
              </p>
            </div>

            {/* Character Length Progress Gauges */}
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border p-2.5 bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Title Length</span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      titleStatus === 'optimal'
                        ? 'text-emerald-500'
                        : titleStatus === 'short'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                    }`}
                  >
                    {titleCount} / 60
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      titleStatus === 'optimal'
                        ? 'bg-emerald-500'
                        : titleStatus === 'short'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min((titleCount / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border p-2.5 bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground">Description</span>
                  <span
                    className={`font-mono text-[11px] font-semibold ${
                      descStatus === 'optimal'
                        ? 'text-emerald-500'
                        : descStatus === 'short'
                          ? 'text-amber-500'
                          : 'text-rose-500'
                    }`}
                  >
                    {descCount} / 160
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      descStatus === 'optimal'
                        ? 'bg-emerald-500'
                        : descStatus === 'short'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min((descCount / 160) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SOCIAL SHARE CARD PREVIEW (OpenGraph / LinkedIn / Twitter) */}
        <Card className="border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Share2 className="size-4 text-primary" /> Social Share Card (OpenGraph)
            </CardTitle>
            <CardDescription className="text-xs">
              Live simulation of links shared on LinkedIn, X (Twitter), WhatsApp, and Slack.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
              {/* Image Banner */}
              <div className="relative aspect-[1.91/1] w-full overflow-hidden bg-slate-900 border-b">
                {effectiveOgImage ? (
                  <img
                    src={effectiveOgImage}
                    alt="Social preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-950 text-white font-bold text-lg">
                    Malek Hussein Portfolio
                  </div>
                )}
              </div>

              {/* Card Metadata Footer */}
              <div className="p-3.5 bg-card/90 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  MRMALEK.COM
                </p>
                <h4 className="text-sm font-bold text-foreground line-clamp-1">
                  {effectiveOgTitle}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {effectiveOgDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: SEO FORM INPUTS & MEDIA LIBRARY UPLOADER */}
      <div className="space-y-6 lg:col-span-6">
        <form onSubmit={submit} className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Search &amp; Share Configuration
              </CardTitle>
              <CardDescription>
                Customize how search crawlers index your portfolio and generate share cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* PAGE TITLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo_title" className="text-sm font-semibold">
                    Page Title *
                  </Label>
                  <span className="text-xs text-muted-foreground">{draft.seo_title.length} characters</span>
                </div>
                <Input
                  id="seo_title"
                  value={draft.seo_title}
                  placeholder={route.defaults.title}
                  onChange={(e) => set('seo_title')(e.target.value)}
                  className="font-medium text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The primary title tag rendered in browser tabs and as the main clickable headline in Google.
                </p>
              </div>

              {/* META DESCRIPTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="meta_description" className="text-sm font-semibold">
                    Meta Description *
                  </Label>
                  <span className="text-xs text-muted-foreground">{draft.meta_description.length} characters</span>
                </div>
                <Textarea
                  id="meta_description"
                  rows={4}
                  value={draft.meta_description}
                  placeholder={route.defaults.description}
                  onChange={(e) => set('meta_description')(e.target.value)}
                  className="text-sm leading-relaxed"
                />
                <p className="text-xs text-muted-foreground">
                  A compelling 2-sentence summary that entices searchers to click through to your portfolio.
                </p>
              </div>

              {/* SOCIAL SHARE IMAGE (OG:IMAGE) */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-sm font-semibold">Social Share Image (OG Image)</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Image shown when your website link is shared on LinkedIn, X (Twitter), WhatsApp, or Slack. Recommended: 1200×630px PNG or JPG.
                </p>
                <ImageUploader
                  id="og_image"
                  value={draft.og_image}
                  onChange={(url) => set('og_image')(url)}
                  help="Upload a new high-resolution banner or select an existing graphic from your Media Library."
                />
              </div>

              {/* OPTIONAL SOCIAL OVERRIDES */}
              <div className="space-y-3 pt-3 border-t">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Optional Social Overrides (Defaults to Title &amp; Description)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="og_title" className="text-xs">Social Share Title Override</Label>
                  <Input
                    id="og_title"
                    value={draft.og_title}
                    placeholder={draft.seo_title || route.defaults.ogTitle}
                    onChange={(e) => set('og_title')(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="og_description" className="text-xs">Social Share Description Override</Label>
                  <Textarea
                    id="og_description"
                    rows={2}
                    value={draft.og_description}
                    placeholder={draft.meta_description || route.defaults.ogDescription}
                    onChange={(e) => set('og_description')(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-3 border-t flex items-center justify-between">
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                  {saving ? 'Saving...' : 'Save SEO & Social Cards'}
                </Button>

                <Button asChild variant="outline" size="sm">
                  <a href={route.path} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5 mr-1.5" /> View Live Site
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
