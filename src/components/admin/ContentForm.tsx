import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useBlocker } from '@tanstack/react-router';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { baseContentSchema, CONTENT_TYPE_CONFIG } from '@/lib/cms/content.types';
import type { Category } from '@/lib/cms/types';
import type { ContentInput, ContentRecord, ContentType } from '@/lib/cms/content.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentFormProps {
  type: ContentType;
  record?: ContentRecord | null;
  categories?: Category[];
  listPath: string;
  onSubmit: (values: ContentInput) => Promise<{ ok: boolean; error?: string }>;
}

export default function ContentForm({ type, record, categories = [], listPath, onSubmit }: ContentFormProps) {
  const config = CONTENT_TYPE_CONFIG[type];
  const [saving, setSaving] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(baseContentSchema),
    defaultValues: {
      type,
      title: record?.title ?? '',
      slug: record?.slug ?? '',
      excerpt: record?.excerpt ?? '',
      body: record?.body ?? '',
      status: record?.status ?? 'draft',
      is_featured: !!record?.is_featured,
      category_id: record?.category_id ?? (categories[0]?.id as number | undefined),
      publish_date: record?.publish_date ?? '',
      details: (record?.details ?? {}) as Record<string, string>,
    } as ContentInput,
  });

  const dirty = form.formState.isDirty && !saving;
  useBlocker({
    shouldBlockFn: () => {
      if (!dirty) return false;
      return !window.confirm('You have unsaved changes. Leave this page anyway?');
    },
  });

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  async function submitWithStatus(status: 'draft' | 'published') {
    form.setValue('status', status, { shouldDirty: true });
    await form.handleSubmit(handleSubmit)();
  }

  async function handleSubmit(values: ContentInput) {
    // Auto-generate clean slug behind the scenes without prompting the user
    const clientVal = (values.details && typeof values.details === 'object' && (values.details as Record<string, string>)['client']) || '';
    const rawSeed = values.slug || clientVal || values.title || 'item';
    const autoSlug = rawSeed
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    values.slug = autoSlug || 'item';

    setSaving(true);
    try {
      const result = await onSubmit(values);
      if (!result.ok) {
        toast.error(result.error ?? 'Could not save. Please try again.');
        return;
      }
      toast.success('Saved successfully');
      form.reset(values);
    } catch {
      toast.error('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue={config.detailFields.length > 0 ? 'content' : 'content'}>
          <TabsList>
            <TabsTrigger value="content">Overview</TabsTrigger>
            {config.detailFields.length > 0 && <TabsTrigger value="details">Details &amp; Story</TabsTrigger>}
            <TabsTrigger value="publishing">Visibility &amp; Status</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{config.label} Overview</CardTitle>
                <CardDescription>Main title and short summary shown in the section card.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder={`e.g. ${type === 'case_study' ? 'B2B Marketplace & Digital Architecture' : type === 'framework' ? 'Discovery & Strategic Alignment' : 'Project Title'}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Summary / Statement *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="A concise 1-2 sentence overview of the project or delivery phase..."
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hide body textarea on case_study where specific challenge/solution/architecture fields are used */}
                {type !== 'case_study' && (
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description / Body</FormLabel>
                        <FormControl>
                          <Textarea rows={6} placeholder="Detailed explanation..." {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormDescription>Text or bullet points.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {config.detailFields.length > 0 && (
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{config.label} Details</CardTitle>
                  <CardDescription>
                    {type === 'case_study'
                      ? 'Challenge, delivered solution, architecture decisions, and measurable outcomes shown in the interactive modal drawer.'
                      : `Fields specific to this ${config.label.toLowerCase()}.`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-2">
                  {config.detailFields.map((detail) => (
                    <FormField
                      key={detail.key}
                      control={form.control}
                      name={`details.${detail.key}` as never}
                      render={({ field }) => (
                        <FormItem className={detail.kind === 'textarea' ? 'md:col-span-2' : ''}>
                          <FormLabel>{detail.label}</FormLabel>
                          <FormControl>
                            {detail.kind === 'textarea' ? (
                              <Textarea
                                rows={detail.key === 'problem' || detail.key === 'solution' ? 4 : 3}
                                placeholder={detail.placeholder}
                                {...field}
                                value={field.value ?? ''}
                              />
                            ) : (
                              <Input placeholder={detail.placeholder} {...field} value={field.value ?? ''} />
                            )}
                          </FormControl>
                          {detail.help && <FormDescription>{detail.help}</FormDescription>}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="publishing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Visibility &amp; Status</CardTitle>
                <CardDescription>Only published items appear on the website.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publication Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft (Private)</SelectItem>
                          <SelectItem value="published">Published (Live on Website)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {config.usesCategory && categories.length > 0 && (
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic Category</FormLabel>
                        <Select
                          value={field.value ? String(field.value) : ''}
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a topic" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={String(category.id)}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {config.usesFeatured && (
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
                        <div>
                          <FormLabel>Feature on landing page</FormLabel>
                          <FormDescription>Highlights this item at the top of its section.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
          <Button type="button" disabled={saving} onClick={() => void submitWithStatus('published')}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 mr-1.5" />}
            {saving ? 'Saving…' : 'Publish to Website'}
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => void submitWithStatus('draft')}>
            <Save className="size-4 mr-1.5" /> Save as Draft
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to={listPath}>Cancel</Link>
          </Button>
          {dirty && <span className="ml-auto text-sm text-amber-500 font-medium">Unsaved changes</span>}
        </div>
      </form>
    </Form>
  );
}
