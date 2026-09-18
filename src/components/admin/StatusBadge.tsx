import { Badge } from '@/components/ui/badge';

export function StatusBadge({ status, publishDate }: { status: string; publishDate?: string | null }) {
  const published = status === 'published';
  const scheduled = published && !!publishDate && new Date(`${publishDate}T23:59:59`).getTime() > Date.now();
  return (
    <Badge variant={published ? (scheduled ? 'outline' : 'default') : 'secondary'} className="capitalize">
      {scheduled ? 'Scheduled' : published ? 'Published' : 'Draft'}
    </Badge>
  );
}

export function FeaturedBadge({ featured }: { featured: boolean }) {
  if (!featured) return <span className="text-muted-foreground">—</span>;
  return <Badge variant="outline">Featured</Badge>;
}
