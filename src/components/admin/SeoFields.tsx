import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

/**
 * The SEO block shared by every content form. Field names are nested under
 * `seo.` so one schema covers the whole form.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SeoFields({ form }: { form: UseFormReturn<any> }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name="seo.seo_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO title</FormLabel>
              <FormControl>
                <Input placeholder="Shown in search results" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>Aim for under 60 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo.canonical_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canonical URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormDescription>Leave empty to use this page's own address.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="seo.meta_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meta description</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="One or two sentences for search results" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormDescription>Aim for 120–160 characters.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name="seo.og_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Share title (Facebook / LinkedIn)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo.og_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Share image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://… (1200×630)" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="seo.og_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Share description</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name="seo.twitter_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>X / Twitter title</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo.twitter_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>X / Twitter image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="seo.twitter_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>X / Twitter description</FormLabel>
            <FormControl>
              <Textarea rows={2} {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="seo.no_index"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Hide from search engines</FormLabel>
                <FormDescription>Adds a noindex tag to this page.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seo.no_follow"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <FormLabel>Don't follow links</FormLabel>
                <FormDescription>Adds a nofollow tag to this page.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
