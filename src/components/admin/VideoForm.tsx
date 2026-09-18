import * as React from 'react';
import { Link, useBlocker } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Video, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { derivedThumbnail, videoInputSchema, type VideoInput, type Category, type VideoWithCategory } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploader from '@/components/admin/ImageUploader';

export type VideoFormValues = VideoInput;

interface VideoFormProps {
  categories: Category[];
  initial?: VideoWithCategory | null;
  onSubmit: (values: VideoFormValues) => Promise<void>;
  mediaLibraryItems?: Array<{ id: number; url: string; file_name: string; alt_text?: string }>;
}

export default function VideoForm({ categories, initial, onSubmit, mediaLibraryItems }: VideoFormProps) {
  const [saving, setSaving] = React.useState(false);

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoInputSchema),
    defaultValues: {
      title: initial?.title ?? '',
      video_url: initial?.video_url ?? '',
      category_id: initial?.category_id ?? (categories[0]?.id as number | undefined),
      description: initial?.description ?? '',
      thumbnail_url: initial?.thumbnail_url ?? '',
      duration: initial?.duration ?? '',
      publish_date: initial?.publish_date ?? '',
      is_featured: initial?.is_featured === 1,
      is_published: initial?.is_published === 1,
    } as VideoFormValues,
  });

  const videoUrl = form.watch('video_url');
  const thumbnailUrl = form.watch('thumbnail_url');
  const preview = derivedThumbnail({ video_url: videoUrl ?? '', thumbnail_url: thumbnailUrl ?? '' });
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

  async function submitWithPublished(isPublished: boolean) {
    form.setValue('is_published', isPublished, { shouldDirty: true });
    await form.handleSubmit(handleSubmit)();
  }

  async function handleSubmit(values: VideoFormValues) {
    setSaving(true);
    try {
      await onSubmit(values);
      toast.success('Saved');
    } catch {
      toast.error('Could not save video. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Video Details */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="size-5 text-primary" /> Video Episode
                </CardTitle>
                <CardDescription>
                  Details shown in the PM Talks carousel and interactive video player on the landing page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Scaling Agile Teams & Fintech Architecture" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="video_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube URL *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..." {...field} />
                      </FormControl>
                      <FormDescription>
                        Supports full YouTube links or youtu.be shortlinks. Embedded directly on the landing page player.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Summary of what is covered in this talk, key architecture decisions, and methodologies discussed..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnail_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Episode Thumbnail (Optional)</FormLabel>
                      <ImageUploader
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        help="Leave blank to automatically use the YouTube HD thumbnail. Upload or select a custom poster image."
                        mediaLibraryItems={mediaLibraryItems}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {preview && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Live Thumbnail Preview</p>
                    <img
                      src={preview}
                      alt="Thumbnail preview"
                      className="aspect-video w-full max-w-md rounded-lg border object-cover shadow-sm"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="size-4 text-primary" /> Display & Category
                </CardTitle>
                <CardDescription className="text-xs">
                  How this episode appears in the landing page carousel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic Category *</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(value) => field.onChange(Number(value))}
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

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 14:20 or 15 min" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publish_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2 border-t space-y-3">
                  <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Published</FormLabel>
                          <FormDescription className="text-xs">Visible on the landing page</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm flex items-center gap-1.5">
                            <Sparkles className="size-3.5 text-amber-500" /> Featured
                          </FormLabel>
                          <FormDescription className="text-xs">Spotlighted first in carousel</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
          <Button type="button" disabled={saving} onClick={() => void submitWithPublished(true)}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4 mr-1.5" />}
            {saving ? 'Saving…' : 'Publish to Website'}
          </Button>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => void submitWithPublished(false)}>
            <Save className="size-4 mr-1.5" /> Save as Draft
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/insights">Cancel</Link>
          </Button>
          {dirty && <span className="ml-auto text-sm text-amber-500 font-medium">Unsaved changes</span>}
        </div>
      </form>
    </Form>
  );
}

export type { VideoInput };
