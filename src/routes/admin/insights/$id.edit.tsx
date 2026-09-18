import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import AdminLayout from '@/components/admin/AdminLayout';
import VideoForm, { type VideoFormValues } from '@/components/admin/VideoForm';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { adminGetVideo, adminListCategories, adminUpdateVideo, requireAdminSession } from '@/lib/cms/admin.functions';
import { adminListMedia } from '@/lib/cms/content.functions';

function EditVideoPage() {
  const { session, categories, video, mediaItems } = Route.useLoaderData();
  const updateVideo = useServerFn(adminUpdateVideo);
  const navigate = useNavigate();
  const router = useRouter();

  if (!video) {
    return (
      <AdminLayout title="Video not found" email={session.email} crumbs={[{ label: 'PM Talks', to: '/admin/insights' }]}>
        <p className="text-sm text-muted-foreground">This video no longer exists.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit PM Talks Episode"
      description={video.title}
      email={session.email}
      crumbs={[{ label: 'PM Talks', to: '/admin/insights' }, { label: 'Edit' }]}
      actions={<StatusBadge status={video.is_published ? 'published' : 'draft'} publishDate={video.publish_date} />}
    >
      <VideoForm
        categories={categories}
        initial={video}
        mediaLibraryItems={mediaItems}
        onSubmit={async (input: VideoFormValues) => {
          await updateVideo({ data: { ...input, id: video.id } });
          await router.invalidate();
          navigate({ to: '/admin/insights' });
        }}
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/insights/$id/edit')({
  loader: async ({ params }) => {
    const id = Number(params.id);
    const [session, categories, video, mediaItems] = await Promise.all([
      requireAdminSession(),
      adminListCategories(),
      adminGetVideo({ data: { id } }),
      adminListMedia(),
    ]);
    return { session, categories, video, mediaItems };
  },
  head: () => ({
    meta: [{ title: 'Edit video | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: EditVideoPage,
});
