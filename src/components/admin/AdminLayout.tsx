import type { ReactNode } from 'react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { LogOut, UserRound } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { adminLogout } from '@/lib/cms/admin.functions';

export interface Crumb {
  label: string;
  to?: string;
}

interface AdminLayoutProps {
  title: string;
  description?: string;
  email?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}

export default function AdminLayout({ title, description, email, crumbs = [], actions, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const logout = useServerFn(adminLogout);

  async function signOut() {
    await logout();
    await router.invalidate();
    navigate({ to: '/admin/login', replace: true });
  }

  return (
    <SidebarProvider className="admin-app">
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink asChild>
                  <Link to="/admin">Content Studio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((crumb) => (
                <span key={crumb.label} className="contents">
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem>
                    {crumb.to ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.to}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserRound className="size-4" />
                  <span className="hidden max-w-[180px] truncate sm:inline">{email ?? 'Admin'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{email ?? 'Signed in'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void signOut()}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </div>
      </SidebarInset>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}
