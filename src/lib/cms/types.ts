// Client-safe CMS types and validation schemas.
// No database access here — these are shared between the admin UI, the public
// pages and the server-side repositories.
import { z } from 'zod';

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  category_id: number | null;
  publish_date: string | null;
  is_featured: 0 | 1;
  is_published: 0 | 1;
  created_at: string;
  updated_at: string;
}

/** A video joined with its category name — what the UI actually renders. */
export interface VideoWithCategory extends Video {
  category_name: string | null;
  category_slug: string | null;
}

export const videoInputSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(140, 'Title must be under 140 characters'),
  video_url: z.string().trim().url('Enter a valid URL').max(500),
  category_id: z.coerce.number().int().positive('Choose a topic'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(600, 'Description must be under 600 characters'),
  thumbnail_url: z.union([z.string().trim().url('Enter a valid thumbnail URL').max(500), z.literal('')]).optional(),
  duration: z.string().trim().max(20).optional(),
  publish_date: z.string().trim().max(40).optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export type VideoInput = z.infer<typeof videoInputSchema>;

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(60, 'Name is too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email').max(200),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

/** Turn any title into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Extract a YouTube video id from the common URL shapes. */
export function youTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?[^#]*v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Fall back to the YouTube poster frame when no custom thumbnail was given. */
export function derivedThumbnail(video: { video_url: string; thumbnail_url?: string | null }): string | null {
  if (video.thumbnail_url) return video.thumbnail_url;
  const id = youTubeId(video.video_url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function embedUrl(url: string): string | null {
  const id = youTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}
