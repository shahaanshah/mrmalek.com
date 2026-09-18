import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { BookOpen, ExternalLink } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminGetHomepage, adminSaveHomepage } from '@/lib/cms/homepage.functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function AboutAdminPage() {
  const { session, content } = Route.useLoaderData();
  const router = useRouter();
  const save = useServerFn(adminSaveHomepage);
  const [busy, setBusy] = React.useState(false);

  const [form, setForm] = React.useState({
    intro_kicker: content.intro_kicker || 'ABOUT',
    intro_title: content.intro_title || 'About Me',
    intro_body: content.intro_body || '',
  });

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await save({ data: form });
      await router.invalidate();
      toast.success('About Me narrative saved successfully!');
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

            <Button type="submit" size="lg" disabled={busy}>
              {busy ? 'Saving...' : 'Save Narrative'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/about')({
  loader: async () => {
    const [session, content] = await Promise.all([
      requireAdminSession(),
      adminGetHomepage(),
    ]);
    return { session, content };
  },
  head: () => ({
    meta: [
      { title: 'About Me Narrative | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AboutAdminPage,
});
