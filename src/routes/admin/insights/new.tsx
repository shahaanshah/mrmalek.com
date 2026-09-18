import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import AdminLayout from '@/components/admin/AdminLayout';
import VideoForm, { type VideoFormValues } from '@/components/admin/VideoForm';
import { adminCreateVideo, adminListCategories, requireAdminSession } from '@/lib/cms/admin.functions';
import { adminListMedia } from '@/lib/cms/content.functions';

function NewVideoPage() {
  const { session, categories, mediaItems } = Route.useLoaderData();
  const createVideo = useServerFn(adminCreateVideo);
  const navigate = useNavigate();
  const router = useRouter();

  return (
    <AdminLayout
      title="Add PM Talks Episode"
      description="Add a new technical breakdown or podcast episode to the video carousel."
      email={session.email}
      crumbs={[{ label: 'PM Talks', to: '/admin/insights' }, { label: 'New' }]}
    >
      <VideoForm
        categories={categories}
        mediaLibraryItems={mediaItems}
        onSubmit={async (input: VideoFormValues) => {
          await createVideo({ data: input });
          await router.invalidate();
          navigate({ to: '/admin/insights' });
        }}
      />
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/insights/new')({
  loader: async () => {
    const [session, categories, mediaItems] = await Promise.all([requireAdminSession(), adminListCategories(), adminListMedia()]);
    return { session, categories, mediaItems };
  },
  head: () => ({
    meta: [{ title: 'Add video | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: NewVideoPage,
});
