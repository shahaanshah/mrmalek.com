import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import {
  Mail,
  MailOpen,
  Inbox,
  Clock,
  Phone,
  User,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmDelete from '@/components/admin/ConfirmDelete';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListContactInquiries,
  adminUpdateInquiryStatus,
  adminDeleteContactInquiry,
} from '@/lib/cms/contact.functions';
import type { ContactSubmission } from '@/server/repositories/contactRepository.server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  } catch {
    return iso;
  }
}

function InquiriesPage() {
  const { session, initialData } = Route.useLoaderData();
  const router = useRouter();

  const updateStatusFn = useServerFn(adminUpdateInquiryStatus);
  const deleteInquiryFn = useServerFn(adminDeleteContactInquiry);

  const [items, setItems] = React.useState<ContactSubmission[]>(initialData.items);
  const [stats, setStats] = React.useState(initialData.stats);
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedInquiry, setSelectedInquiry] = React.useState<ContactSubmission | null>(null);
  const [busyId, setBusyId] = React.useState<number | null>(null);

  // Sync state when router re-validates
  React.useEffect(() => {
    setItems(initialData.items);
    setStats(initialData.stats);
  }, [initialData]);

  // Filtered inquiries
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab === 'unread' && item.status !== 'unread') return false;
      if (activeTab === 'read' && item.status !== 'read') return false;
      if (activeTab === 'archived' && item.status !== 'archived') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesTopic = (item.topic || '').toLowerCase().includes(q);
        const matchesMessage = item.message.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesTopic || matchesMessage;
      }
      return true;
    });
  }, [items, activeTab, searchTerm]);

  async function handleToggleStatus(item: ContactSubmission, newStatus: 'unread' | 'read' | 'archived') {
    setBusyId(item.id);
    try {
      await updateStatusFn({ data: { id: item.id, status: newStatus } });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i)),
      );
      if (selectedInquiry?.id === item.id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      await router.invalidate();
      toast.success(newStatus === 'read' ? 'Marked as read' : newStatus === 'unread' ? 'Marked as unread' : 'Archived');
    } catch {
      toast.error('Could not update inquiry status.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    try {
      await deleteInquiryFn({ data: { id } });
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
      await router.invalidate();
      toast.success('Inquiry deleted');
    } catch {
      toast.error('Could not delete inquiry.');
    } finally {
      setBusyId(null);
    }
  }

  function openDetails(item: ContactSubmission) {
    setSelectedInquiry(item);
    // Automatically mark as read when opened if it was unread
    if (item.status === 'unread') {
      void handleToggleStatus(item, 'read');
    }
  }

  return (
    <AdminLayout
      title="Client Inquiries & Messages"
      description="Direct inquiries and project leads submitted through your website's contact form."
      email={session.email}
      crumbs={[{ label: 'Client Inquiries' }]}
      actions={
        <Button asChild variant="outline">
          <a href="/#contact" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 size-4" /> View Live Form
          </a>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* STATS OVERVIEW CARDS */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Inquiries</CardTitle>
              <Inbox className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time received messages</p>
            </CardContent>
          </Card>

          <Card className={stats.unread > 0 ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-border/60'}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">Unread Messages</CardTitle>
              <Mail className="size-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                {stats.unread}
                {stats.unread > 0 && (
                  <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className="text-xs text-emerald-400/80 mt-1">Awaiting client response</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviewed &amp; Read</CardTitle>
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.read}</div>
              <p className="text-xs text-muted-foreground mt-1">Processed inquiries</p>
            </CardContent>
          </Card>
        </div>

        {/* CONTROLS: TABS & SEARCH */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as typeof activeTab)}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                All <span className="text-xs text-muted-foreground">({items.length})</span>
              </TabsTrigger>
              <TabsTrigger value="unread" className="gap-1.5">
                Unread
                {stats.unread > 0 && (
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-none text-[10px] px-1.5 py-0">
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, topic…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </div>

        {/* INQUIRIES LIST */}
        {filteredItems.length === 0 ? (
          <Card className="border-dashed border-border/80">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="size-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-semibold">No inquiries found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {searchTerm
                  ? `No messages matched your search query "${searchTerm}".`
                  : activeTab === 'unread'
                    ? 'All caught up! No unread messages.'
                    : 'When visitors submit the contact form on your website, their inquiries will appear here.'}
              </p>
              {searchTerm && (
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="mt-4">
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className={`transition-all hover:border-primary/40 cursor-pointer ${
                  item.status === 'unread'
                    ? 'border-emerald-500/30 bg-emerald-950/5 shadow-sm'
                    : 'border-border/60 bg-card/60'
                }`}
                onClick={() => openDetails(item)}
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Sender Info + Excerpt */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.status === 'unread' ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] gap-1 px-2 py-0.5">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Unread
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[11px] px-2 py-0.5">
                          Read
                        </Badge>
                      )}

                      <span className="font-bold text-foreground text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground font-mono">&lt;{item.email}&gt;</span>

                      {item.topic && (
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          {item.topic}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 pr-4 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground/80 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-muted-foreground" />
                        {formatDate(item.created_at)}
                      </span>
                      {item.phone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="size-3 text-muted-foreground" />
                          {item.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetails(item)}
                      className="text-xs h-8 gap-1"
                    >
                      <MessageSquare className="size-3.5" /> View
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(item, item.status === 'unread' ? 'read' : 'unread')}
                      disabled={busyId === item.id}
                      className="text-xs h-8 px-2"
                      title={item.status === 'unread' ? 'Mark as read' : 'Mark as unread'}
                    >
                      {item.status === 'unread' ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
                    </Button>

                    <ConfirmDelete
                      title={`Delete inquiry from ${item.name}?`}
                      description="This message will be permanently removed from your database."
                      onConfirm={() => handleDelete(item.id)}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busyId === item.id}
                          className="size-8 text-destructive hover:bg-destructive/10"
                          aria-label="Delete message"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* INQUIRY DETAIL DIALOG */}
        <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
          {selectedInquiry && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <DialogTitle className="text-lg flex items-center gap-2">
                    <User className="size-5 text-primary" /> {selectedInquiry.name}
                  </DialogTitle>
                  {selectedInquiry.status === 'unread' ? (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">
                      Unread
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-xs">
                      Read
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground font-mono">
                  Received {formatDate(selectedInquiry.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Contact Card Strip */}
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3 grid gap-2 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.topic || 'Inquiry')} - Malek Hussein`}
                      className="font-medium text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {selectedInquiry.email} <ArrowUpRight className="size-3" />
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">
                      Phone / WhatsApp
                    </span>
                    {selectedInquiry.phone ? (
                      <a
                        href={`tel:${selectedInquiry.phone.replace(/[^0-9+]/g, '')}`}
                        className="font-medium text-foreground hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {selectedInquiry.phone} <ArrowUpRight className="size-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground mt-0.5 block">Not provided</span>
                    )}
                  </div>

                  <div className="sm:col-span-2 pt-1 border-t border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">
                      Discussion Topic
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {selectedInquiry.topic || 'General Inquiry'}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Message Content
                  </span>
                  <div className="rounded-lg border border-border/80 bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between items-center pt-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleToggleStatus(
                        selectedInquiry,
                        selectedInquiry.status === 'unread' ? 'read' : 'unread',
                      )
                    }
                    className="text-xs"
                  >
                    {selectedInquiry.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                  </Button>
                  <ConfirmDelete
                    title={`Delete inquiry from ${selectedInquiry.name}?`}
                    description="This message will be permanently removed from your database."
                    onConfirm={() => handleDelete(selectedInquiry.id)}
                    trigger={
                      <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-3.5 mr-1" /> Delete
                      </Button>
                    }
                  />
                </div>

                <Button asChild size="sm" className="gap-1.5">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.topic || 'Inquiry')} - Malek Hussein`}
                  >
                    <Mail className="size-3.5" /> Reply via Email
                  </a>
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/inquiries')({
  loader: async () => {
    const session = await requireAdminSession();
    const initialData = await adminListContactInquiries({ data: { limit: 100 } });
    return { session, initialData };
  },
  head: () => ({
    meta: [
      { title: 'Client Inquiries | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: InquiriesPage,
});
