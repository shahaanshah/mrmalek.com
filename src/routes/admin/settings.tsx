import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Plus, Trash2, Tag, Lock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  requireAdminSession,
} from '@/lib/cms/admin.functions';
import { adminChangePassword } from '@/lib/cms/content.functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SettingsPage() {
  const { session, categories } = Route.useLoaderData();
  const router = useRouter();
  const changePassword = useServerFn(adminChangePassword);
  const createCategory = useServerFn(adminCreateCategory);
  const deleteCategory = useServerFn(adminDeleteCategory);
  const [busy, setBusy] = React.useState(false);

  async function onChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    try {
      const result = await changePassword({
        data: {
          current_password: String(data.get('current_password') ?? ''),
          new_password: String(data.get('new_password') ?? ''),
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      form.reset();
      toast.success('Password updated successfully');
    } catch {
      toast.error('Could not update the password.');
    } finally {
      setBusy(false);
    }
  }

  async function onAddCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get('name') ?? '').trim();
    if (name.length < 2) {
      toast.error('Enter a valid topic category name');
      return;
    }
    setBusy(true);
    try {
      await createCategory({ data: { name } });
      form.reset();
      await router.invalidate();
      toast.success(`Topic "${name}" added`);
    } catch {
      toast.error('Could not add that topic.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayout
      title="Settings & Taxonomy"
      description="Manage content taxonomy categories and administrator account security."
      email={session.email}
      crumbs={[{ label: 'Settings' }]}
    >
      {/* Studio Quick Shortcuts */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  🎨
                </span>
                Brand &amp; Visual Identity
              </CardTitle>
              <Button asChild size="sm" variant="outline">
                <a href="/admin/branding">
                  Open Studio <ExternalLink className="size-3 ml-1" />
                </a>
              </Button>
            </div>
            <CardDescription className="text-xs">
              Upload logo &amp; favicon, official CV/Resume PDF, and direct contact endpoints (Email, Phone, WhatsApp).
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/60 bg-gradient-to-br from-card to-muted/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                  🔍
                </span>
                SEO &amp; Social Share Cards
              </CardTitle>
              <Button asChild size="sm" variant="outline">
                <a href="/admin/seo">
                  Open Studio <ExternalLink className="size-3 ml-1" />
                </a>
              </Button>
            </div>
            <CardDescription className="text-xs">
              Google search results snippet, social media OpenGraph share cards, and metadata.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics" className="flex items-center gap-1.5">
            <Tag className="size-3.5" /> Topics Taxonomy
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-1.5">
            <Lock className="size-3.5" /> Account Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Categories</CardTitle>
              <CardDescription>
                Taxonomy labels used to filter and group PM Talks video episodes, case studies, and toolkit domains.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={onAddCategory} className="flex flex-wrap gap-2">
                <Input
                  name="name"
                  placeholder="New category name (e.g. B2B SaaS, Platform Architecture, FinTech)"
                  className="max-w-md"
                />
                <Button type="submit" disabled={busy}>
                  <Plus className="size-4 mr-1.5" /> Add Category
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((category) => (
                  <Badge key={category.id} variant="outline" className="gap-2 py-1.5 pl-3 pr-1.5 text-sm">
                    {category.name}
                    <ConfirmDelete
                      title={`Delete "${category.name}"?`}
                      description="Items using this topic keep their content but lose the category tag."
                      onConfirm={async () => {
                        await deleteCategory({ data: { id: category.id } });
                        await router.invalidate();
                        toast.success('Category removed');
                      }}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 ml-1 hover:bg-destructive/10"
                          aria-label="Delete category"
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      }
                    />
                  </Badge>
                ))}
                {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories defined yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Administrator Password</CardTitle>
              <CardDescription>Signed in as {session.email}.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onChangePassword} className="grid max-w-sm gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="current_password">Current password</Label>
                  <Input id="current_password" name="current_password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new_password">New password (minimum 8 characters)</Label>
                  <Input id="new_password" name="new_password" type="password" minLength={8} required />
                </div>
                <Button type="submit" disabled={busy}>
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/settings')({
  loader: async () => {
    const [session, categories] = await Promise.all([
      requireAdminSession(),
      adminListCategories(),
    ]);
    return { session, categories };
  },
  head: () => ({
    meta: [{ title: 'Settings | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: SettingsPage,
});
