import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Briefcase,
  CheckCircle2,
  Clock3,
  ExternalLink,
  History,
  Home,
  Image as ImageIcon,
  Palette,
  Plus,
  Rocket,
  Route as RouteIcon,
  Video,
  Wrench,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminOverview } from '@/lib/cms/content.functions';
import { formatDate } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TYPE_LABEL: Record<string, string> = {
  case_study: 'Case study',
  venture: 'Venture',
  framework: 'Framework step',
};

function DashboardPage() {
  const { session, overview } = Route.useLoaderData();
  const counts = overview.counts;
  const publishedTotal = overview.videos.published + Object.values(counts).reduce((sum, count) => sum + count.published, 0);
  const draftTotal = overview.videos.draft + Object.values(counts).reduce((sum, count) => sum + count.draft, 0);

  const cards: Array<{
    label: string;
    icon: typeof Video;
    published: number;
    draft: number;
    typeSlug?: string;
  }> = [
    {
      label: 'Videos & PM Talks',
      icon: Video,
      published: overview.videos.published,
      draft: overview.videos.draft,
    },
    {
      label: 'Case Studies',
      icon: Briefcase,
      published: counts['case_study']?.published ?? 0,
      draft: counts['case_study']?.draft ?? 0,
      typeSlug: 'case-studies',
    },
    {
      label: 'How I Work (Process)',
      icon: RouteIcon,
      published: counts['framework']?.published ?? 0,
      draft: counts['framework']?.draft ?? 0,
      typeSlug: 'frameworks',
    },
    {
      label: 'Outside Ventures',
      icon: Rocket,
      published: counts['venture']?.published ?? 0,
      draft: counts['venture']?.draft ?? 0,
      typeSlug: 'ventures',
    },
  ];

  return (
    <AdminLayout
      title="Overview"
      description="Single-page portfolio content and section status at a glance."
      email={session.email}
      crumbs={[{ label: 'Overview' }]}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="size-4 mr-1.5" /> View Live Site
            </a>
          </Button>
          <Button asChild>
            <Link to="/admin/content/$type/new" params={{ type: 'case-studies' }}>
              <Plus className="size-4 mr-1.5" /> Add Case Study
            </Link>
          </Button>
        </div>
      }
    >
      {/* 4 Section Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <card.icon className="size-4" />
                {card.label}
              </CardDescription>
              <CardTitle className="text-3xl">{card.published + card.draft}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{card.published} live · {card.draft} draft{card.draft === 1 ? '' : 's'}</span>
              {card.typeSlug ? (
                <Link
                  to="/admin/content/$type"
                  params={{ type: card.typeSlug }}
                  className="text-primary hover:underline font-medium"
                >
                  Manage
                </Link>
              ) : (
                <Link to="/admin/insights" className="text-primary hover:underline font-medium">
                  Manage
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Global Status Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-semibold">{publishedTotal}</p>
              <p className="text-sm text-muted-foreground">Published items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Clock3 className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-semibold">{draftTotal}</p>
              <p className="text-sm text-muted-foreground">Drafts in progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <ImageIcon className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-semibold">{overview.mediaCount}</p>
              <p className="text-sm text-muted-foreground">Media files uploaded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recently Updated */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recently updated</CardTitle>
            <CardDescription>The last items modified across sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {overview.recent.length === 0 && (
              <p className="text-sm text-muted-foreground">Nothing has been created in the content library yet.</p>
            )}
            {overview.recent.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <div>
                  <Link
                    to="/admin/content/$type/$id/edit"
                    params={{
                      type: item.type === 'case_study' ? 'case-studies' : item.type === 'venture' ? 'ventures' : item.type === 'framework' ? 'frameworks' : 'case-studies',
                      id: String(item.id),
                    }}
                    className="font-medium hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {TYPE_LABEL[item.type] ?? item.type} · updated {formatDate(item.updated_at)}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Jump to Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Direct shortcuts to manage sections.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/branding">
                <Palette className="size-4 mr-2" /> Brand &amp; Assets (Logo, CV)
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/homepage">
                <Home className="size-4 mr-2" /> Hero &amp; Intro Content
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/content/$type" params={{ type: 'case-studies' }}>
                <Briefcase className="size-4 mr-2" /> Case Studies Slider
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/insights">
                <Video className="size-4 mr-2" /> Videos &amp; PM Talks
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/content/$type" params={{ type: 'frameworks' }}>
                <RouteIcon className="size-4 mr-2" /> 4-Phase Process Roadmap
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/toolkit">
                <Wrench className="size-4 mr-2" /> Skills &amp; Software Tools
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link to="/admin/media">
                <ImageIcon className="size-4 mr-2" /> Media Library ({overview.mediaCount})
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Latest Video */}
      {overview.videos.latest && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Video Episode</CardTitle>
            <CardDescription>
              {overview.videos.latest.category_name ?? 'General'} · {formatDate(overview.videos.latest.publish_date)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{overview.videos.latest.title}</p>
              <p className="max-w-2xl text-sm text-muted-foreground">{overview.videos.latest.description}</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/admin/insights/$id/edit" params={{ id: String(overview.videos.latest.id) }}>
                Edit Episode
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Studio Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="size-4" /> Recent activity</CardTitle>
          <CardDescription>Recent changes in Content Studio.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {overview.activity.length === 0 && <p className="text-sm text-muted-foreground">No activity recorded yet.</p>}
          {overview.activity.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0">
              <div><p className="text-sm font-medium capitalize">{entry.action} · {entry.entity_type.replaceAll('_', ' ')}</p><p className="text-xs text-muted-foreground">{entry.summary || 'Content updated'}</p></div>
              <span className="text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const [session, overview] = await Promise.all([requireAdminSession(), adminOverview()]);
    return { session, overview };
  },
  head: () => ({
    meta: [
      { title: 'Dashboard | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'description', content: 'Private administration area.' },
    ],
  }),
  component: DashboardPage,
});
