import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Home,
  Palette,
  Building2,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Quote,
  FileText,
  Video,
  Rocket,
  Route as RouteIcon,
  Search,
  Image as ImageIcon,
  Settings,
  Users,
  History,
  ExternalLink,
  BookOpen,
  Layers,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dashboard',
    items: [{ label: 'Overview', to: '/admin', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Landing Sections',
    items: [
      { label: 'Brand & Assets', to: '/admin/branding', icon: Palette },
      { label: 'Hero & Portrait', to: '/admin/homepage', icon: Home },
      { label: 'About Me Story', to: '/admin/about', icon: BookOpen },
      { label: 'Section Headings', to: '/admin/sections', icon: Layers },
      { label: 'Client Partners', to: '/admin/clients', icon: Building2 },
      { label: 'Case Studies', to: '/admin/content/case-studies', icon: FileText },
      { label: 'How I Work (Process)', to: '/admin/content/frameworks', icon: RouteIcon },
      { label: 'Videos & PM Talks', to: '/admin/insights', icon: Video },
      { label: 'Toolkit & Skills', to: '/admin/toolkit', icon: Wrench },
      { label: 'Career Experience', to: '/admin/experience', icon: Briefcase },
      { label: 'Credentials', to: '/admin/credentials', icon: GraduationCap },
      { label: 'Other Projects', to: '/admin/projects', icon: FolderGit2 },
      { label: 'Testimonials', to: '/admin/testimonials', icon: Quote },
      { label: 'Outside Work / Ventures', to: '/admin/content/ventures', icon: Rocket },
    ],
  },
  {
    label: 'Site & Media',
    items: [
      { label: 'Media Library', to: '/admin/media', icon: ImageIcon },
      { label: 'SEO & Meta', to: '/admin/seo', icon: Search },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', to: '/admin/settings', icon: Settings },
      { label: 'Admin Users', to: '/admin/users', icon: Users },
      { label: 'Activity Log', to: '/admin/activity', icon: History },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isActive = (item: NavItem) => (item.exact ? pathname === item.to : pathname.startsWith(item.to));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold">
            M
          </div>
          <div className="grid text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-semibold">Content Studio</span>
            <span className="text-xs text-muted-foreground">Malek Hussein</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item)} tooltip={item.label}>
                      <Link to={item.to}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View website">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                <span>View website</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
