import { createFileRoute } from '@tanstack/react-router';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import { adminListUsers } from '@/lib/cms/content.functions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function UsersPage() {
  const { session, users } = Route.useLoaderData();

  return (
    <AdminLayout
      title="Admin users"
      description="Who can sign in to the studio."
      email={session.email}
      crumbs={[{ label: 'Admin users' }]}
    >
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>Change your own password from the Settings page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Added</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.email === session.email && <Badge variant="outline">You</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/users')({
  loader: async () => {
    const [session, users] = await Promise.all([requireAdminSession(), adminListUsers()]);
    return { session, users };
  },
  head: () => ({ meta: [{ title: 'Admin users | Content Studio' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: UsersPage,
});
