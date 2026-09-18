import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Palette, ExternalLink, Download, FileText, Globe, Mail, Phone, Share2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploader from '@/components/admin/ImageUploader';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminGetBranding, adminSaveBranding } from '@/lib/cms/landing.functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BrandingFormState {
  site_logo: string;
  site_favicon: string;
  cv_resume_pdf: string;
  brand_name: string;
  brand_title: string;
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_location: string;
  social_linkedin: string;
  social_github: string;
  social_twitter: string;
  social_youtube: string;
  footer_tagline: string;
}

function BrandingPage() {
  const { session, branding } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(adminSaveBranding);

  const [form, setForm] = React.useState<BrandingFormState>({
    site_logo: branding.settings['site_logo'] || '',
    site_favicon: branding.settings['site_favicon'] || '',
    cv_resume_pdf: branding.settings['cv_resume_pdf'] || '/cv-malek-hussein.pdf',
    brand_name: branding.settings['brand_name'] || 'Malek Hussein',
    brand_title: branding.settings['brand_title'] || 'Product Leader & Strategic Builder',
    contact_email: branding.settings['contact_email'] || 'malek@mrmalek.com',
    contact_phone: branding.settings['contact_phone'] || '+1 (613) 400-3490',
    contact_whatsapp: branding.settings['contact_whatsapp'] || '+1 (613) 400-3490',
    contact_location: branding.settings['contact_location'] || 'Ottawa, Ontario, Canada',
    social_linkedin: branding.settings['social_linkedin'] || 'https://www.linkedin.com/in/malek-hussein/',
    social_github: branding.settings['social_github'] || '',
    social_twitter: branding.settings['social_twitter'] || '',
    social_youtube: branding.settings['social_youtube'] || '',
    footer_tagline: branding.settings['footer_tagline'] || 'Engineering products that scale.',
  });

  const [busy, setBusy] = React.useState(false);

  function updateField(key: keyof BrandingFormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({ data: form });
      await router.invalidate();
      toast.success('Branding and site assets saved successfully!');
    } catch {
      toast.error('Could not save branding settings');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout
      title="Brand & Assets"
      description="Upload and configure your site logo, favicon, official CV/Resume PDF, brand identity, and direct contact endpoints."
      email={session.email}
      crumbs={[{ label: 'Brand & Assets' }]}
      actions={
        <Button asChild variant="outline">
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" /> Preview Live Site
          </a>
        </Button>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-6">
        {/* Core Media Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5 text-primary" /> Visual Assets & Documents
            </CardTitle>
            <CardDescription>
              Upload high-resolution logos, favicons, and the downloadable PDF resume.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Brand Logo (Navbar & Footer)</Label>
              <ImageUploader
                value={form.site_logo}
                onChange={(url) => updateField('site_logo', url)}
                help="Recommended: Transparent PNG or SVG (min height 48px). Leave empty to use default vector monogram."
                mediaLibraryItems={branding.mediaItems}
              />
            </div>

            <div className="space-y-2">
              <Label>Browser Favicon</Label>
              <ImageUploader
                value={form.site_favicon}
                onChange={(url) => updateField('site_favicon', url)}
                help="Displayed on browser tabs and bookmarks. PNG or ICO."
                mediaLibraryItems={branding.mediaItems}
              />
            </div>

            <div className="space-y-2">
              <Label>Official CV / Resume PDF</Label>
              <ImageUploader
                value={form.cv_resume_pdf}
                onChange={(url) => updateField('cv_resume_pdf', url)}
                isPdf
                accept="application/pdf"
                help="Official PDF downloaded when visitors click 'Download Official CV' on the landing page banner below Education & Certifications."
                mediaLibraryItems={branding.mediaItems}
              />
              {form.cv_resume_pdf && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Button asChild variant="outline" size="sm" className="h-7">
                    <a href={form.cv_resume_pdf} target="_blank" rel="noreferrer">
                      <Download className="mr-1 size-3" /> Test PDF Download
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Identity & Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5 text-primary" /> Brand Identity
            </CardTitle>
            <CardDescription>Names and taglines rendered across the header, footer, and metadata.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={form.brand_name}
                onChange={(e) => updateField('brand_name', e.target.value)}
                placeholder="Malek Hussein"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_title">Professional Title</Label>
              <Input
                id="brand_title"
                value={form.brand_title}
                onChange={(e) => updateField('brand_title', e.target.value)}
                placeholder="Product Leader & Strategic Builder"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="footer_tagline">Footer Tagline</Label>
              <Input
                id="footer_tagline"
                value={form.footer_tagline}
                onChange={(e) => updateField('footer_tagline', e.target.value)}
                placeholder="Engineering products that scale."
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5 text-primary" /> Direct Contact Endpoints
            </CardTitle>
            <CardDescription>
              Wired to contact CTAs, mailto triggers, WhatsApp buttons, and the booking section.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email Address</Label>
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone / Cell</Label>
              <Input
                id="contact_phone"
                value={form.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_whatsapp">WhatsApp Direct Number</Label>
              <Input
                id="contact_whatsapp"
                value={form.contact_whatsapp}
                onChange={(e) => updateField('contact_whatsapp', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_location">Primary Location / Base</Label>
              <Input
                id="contact_location"
                value={form.contact_location}
                onChange={(e) => updateField('contact_location', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social & Professional Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="size-5 text-primary" /> Social & Professional Profiles
            </CardTitle>
            <CardDescription>Direct profile links shown on the navigation, about, and footer.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="social_linkedin">LinkedIn Profile URL</Label>
              <Input
                id="social_linkedin"
                value={form.social_linkedin}
                onChange={(e) => updateField('social_linkedin', e.target.value)}
                placeholder="https://www.linkedin.com/in/malek-hussein/"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_github">GitHub URL</Label>
              <Input
                id="social_github"
                value={form.social_github}
                onChange={(e) => updateField('social_github', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_twitter">X / Twitter URL</Label>
              <Input
                id="social_twitter"
                value={form.social_twitter}
                onChange={(e) => updateField('social_twitter', e.target.value)}
                placeholder="https://x.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_youtube">YouTube Channel URL</Label>
              <Input
                id="social_youtube"
                value={form.social_youtube}
                onChange={(e) => updateField('social_youtube', e.target.value)}
                placeholder="https://youtube.com/@..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex justify-end border-t bg-background/95 py-3 backdrop-blur">
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Saving...' : 'Save Brand Settings'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/branding')({
  loader: async () => {
    const [session, branding] = await Promise.all([requireAdminSession(), adminGetBranding()]);
    return { session, branding };
  },
  head: () => ({
    meta: [{ title: 'Brand & Assets | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: BrandingPage,
});
