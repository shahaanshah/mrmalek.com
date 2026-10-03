import * as React from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import {
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Search,
  Eye,
  EyeOff,
  Palette,
  Type,
  Layout,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { requireAdminSession } from '@/lib/cms/admin.functions';
import {
  adminListLandingSections,
  adminSaveLandingSection,
  adminToggleLandingSection,
  adminDeleteLandingSection,
} from '@/lib/cms/sections.functions';
import {
  LandingSection,
  landingSectionSchema,
  SECTION_ICONS,
  BADGE_COLOR_PRESETS,
  DEFAULT_LANDING_SECTIONS,
} from '@/lib/cms/sections.types';
import SectionBadge, { ICON_MAP } from '@/components/ui/SectionBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const FONT_SIZE_OPTIONS = [
  { label: '0.65rem (Tiny)', value: '0.65rem' },
  { label: '0.70rem (Extra Small)', value: '0.7rem' },
  { label: '0.75rem (Small • Default)', value: '0.75rem' },
  { label: '0.85rem (Medium)', value: '0.85rem' },
  { label: '1.00rem (Large)', value: '1rem' },
  { label: '1.15rem (Extra Large)', value: '1.15rem' },
];

const FONT_FAMILY_OPTIONS = [
  { label: 'Monospace (Default • Tech style)', value: 'mono' as const },
  { label: 'Sans-Serif (Clean Modern)', value: 'sans' as const },
  { label: 'Heading (Syne / Bold Editorial)', value: 'heading' as const },
];

const FONT_WEIGHT_OPTIONS = [
  { label: 'Regular (400)', value: '400' },
  { label: 'Medium (500)', value: '500' },
  { label: 'Semibold (600 • Default)', value: '600' },
  { label: 'Bold (700)', value: '700' },
  { label: 'Extra Bold (800)', value: '800' },
];

const TEXT_TRANSFORM_OPTIONS = [
  { label: 'UPPERCASE (Default)', value: 'uppercase' as const },
  { label: 'Capitalize Words', value: 'capitalize' as const },
  { label: 'Normal / As Typed', value: 'none' as const },
];

const LETTER_SPACING_OPTIONS = [
  { label: 'Normal (0.02em)', value: '0.02em' },
  { label: 'Wide (0.08em • Default)', value: '0.08em' },
  { label: 'Extra Wide (0.15em)', value: '0.15em' },
  { label: 'Ultra Spaced (0.22em)', value: '0.22em' },
];

function SectionsAdminPage() {
  const { session, sections: initialSections } = Route.useLoaderData();
  const router = useRouter();

  const saveFn = useServerFn(adminSaveLandingSection);
  const toggleFn = useServerFn(adminToggleLandingSection);
  const deleteFn = useServerFn(adminDeleteLandingSection);

  const [sectionsList, setSectionsList] = React.useState<LandingSection[]>(() =>
    [...initialSections].sort((a, b) => a.sort_order - b.sort_order)
  );

  const [formData, setFormData] = React.useState<Record<string, LandingSection>>(() =>
    Object.fromEntries(initialSections.map((s) => [s.id, { ...s }]))
  );

  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() => {
    // Default open the first two sections
    const initialOpen: Record<string, boolean> = {};
    if (initialSections.length > 0) initialOpen[initialSections[0].id] = true;
    if (initialSections.length > 1) initialOpen[initialSections[1].id] = true;
    return initialOpen;
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [busyIds, setBusyIds] = React.useState<Record<string, boolean>>({});
  const [globalBusy, setGlobalBusy] = React.useState(false);

  // Add Section Modal
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newSection, setNewSection] = React.useState<Partial<LandingSection>>({
    id: '',
    title: '',
    description: '',
    kicker: 'NEW SECTION',
    kicker_icon: 'sparkles',
    kicker_font_size: '0.75rem',
    kicker_font_family: 'mono',
    kicker_font_weight: '600',
    kicker_text_color: 'var(--accent-gold-light)',
    kicker_bg_color: 'var(--accent-gold-bg)',
    kicker_border_color: 'var(--accent-gold-border)',
    kicker_icon_color: 'var(--accent-gold)',
    kicker_letter_spacing: '0.08em',
    kicker_text_transform: 'uppercase',
    kicker_enabled: 1,
    main_heading: 'New Section',
    highlight_text: 'Heading',
    subtitle: 'Description of the section.',
    is_enabled: 1,
    is_collapsible: 0,
    default_collapsed: 0,
    sort_order: sectionsList.length,
  });

  // Delete / Reset Confirmation
  const [deleteTarget, setDeleteTarget] = React.useState<LandingSection | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    sectionsList.forEach((s) => {
      allOpen[s.id] = true;
    });
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  const updateField = <K extends keyof LandingSection>(
    id: string,
    key: K,
    value: LandingSection[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  const applyColorPreset = (id: string, preset: (typeof BADGE_COLOR_PRESETS)[number]) => {
    setFormData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        kicker_text_color: preset.textColor,
        kicker_bg_color: preset.bgColor,
        kicker_border_color: preset.borderColor,
        kicker_icon_color: preset.iconColor,
      },
    }));
    toast.success(`Applied ${preset.name} palette`);
  };

  // Quick toggle section enabled/disabled
  const handleToggleEnabled = async (sec: LandingSection, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !Boolean(formData[sec.id]?.is_enabled);
    updateField(sec.id, 'is_enabled', nextState ? 1 : 0);

    try {
      await toggleFn({ data: { id: sec.id, isEnabled: nextState } });
      await router.invalidate();
      toast.success(`${sec.title} is now ${nextState ? 'visible' : 'hidden'} on the live site!`);
    } catch {
      toast.error('Could not toggle section visibility');
    }
  };

  // Save a single section
  const handleSaveSection = async (id: string) => {
    const sec = formData[id];
    if (!sec) return;

    const parsed = landingSectionSchema.safeParse(sec);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Check the input values');
      return;
    }

    setBusyIds((prev) => ({ ...prev, [id]: true }));
    try {
      await saveFn({ data: parsed.data });
      await router.invalidate();
      toast.success(`"${sec.title}" saved successfully!`);
    } catch {
      toast.error(`Could not save section "${sec.title}".`);
    } finally {
      setBusyIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Save all sections at once
  const handleSaveAll = async () => {
    setGlobalBusy(true);
    let successCount = 0;
    try {
      for (const sec of sectionsList) {
        const data = formData[sec.id];
        if (data) {
          const parsed = landingSectionSchema.safeParse(data);
          if (parsed.success) {
            await saveFn({ data: parsed.data });
            successCount++;
          }
        }
      }
      await router.invalidate();
      toast.success(`Successfully saved ${successCount} sections!`);
    } catch {
      toast.error('Failed while saving all sections');
    } finally {
      setGlobalBusy(false);
    }
  };

  // Create new section
  const handleCreateSection = async () => {
    if (!newSection.id || !newSection.title) {
      toast.error('Section ID and Title are required');
      return;
    }

    const cleanId = newSection.id
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '_');

    const toCreate: LandingSection = {
      id: cleanId,
      title: newSection.title.trim(),
      description: newSection.description ?? '',
      kicker: newSection.kicker ?? 'NEW SECTION',
      kicker_icon: newSection.kicker_icon ?? 'sparkles',
      kicker_logo_url: newSection.kicker_logo_url ?? '',
      kicker_font_size: newSection.kicker_font_size ?? '0.75rem',
      kicker_font_family: newSection.kicker_font_family ?? 'mono',
      kicker_font_weight: newSection.kicker_font_weight ?? '600',
      kicker_text_color: newSection.kicker_text_color ?? 'var(--accent-gold-light)',
      kicker_bg_color: newSection.kicker_bg_color ?? 'var(--accent-gold-bg)',
      kicker_border_color: newSection.kicker_border_color ?? 'var(--accent-gold-border)',
      kicker_icon_color: newSection.kicker_icon_color ?? 'var(--accent-gold)',
      kicker_letter_spacing: newSection.kicker_letter_spacing ?? '0.08em',
      kicker_text_transform: newSection.kicker_text_transform ?? 'uppercase',
      kicker_enabled: 1,
      main_heading: newSection.main_heading ?? '',
      highlight_text: newSection.highlight_text ?? '',
      subtitle: newSection.subtitle ?? '',
      is_enabled: 1,
      is_collapsible: newSection.is_collapsible ? 1 : 0,
      default_collapsed: newSection.default_collapsed ? 1 : 0,
      sort_order: sectionsList.length,
    };

    setGlobalBusy(true);
    try {
      await saveFn({ data: toCreate });
      setSectionsList((prev) => [...prev, toCreate]);
      setFormData((prev) => ({ ...prev, [toCreate.id]: toCreate }));
      setOpenSections((prev) => ({ ...prev, [toCreate.id]: true }));
      setIsAddOpen(false);
      await router.invalidate();
      toast.success(`Section "${toCreate.title}" created successfully!`);
    } catch {
      toast.error('Could not create section');
    } finally {
      setGlobalBusy(false);
    }
  };

  // Reset or Delete section
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setGlobalBusy(true);
    try {
      const defaultMatch = DEFAULT_LANDING_SECTIONS.find((d) => d.id === deleteTarget.id);

      if (defaultMatch) {
        // Reset to default
        await saveFn({ data: defaultMatch });
        setFormData((prev) => ({ ...prev, [deleteTarget.id]: { ...defaultMatch } }));
        toast.success(`Reset "${deleteTarget.title}" back to system defaults`);
      } else {
        // Custom section: delete
        await deleteFn({ data: { id: deleteTarget.id } });
        setSectionsList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setFormData((prev) => {
          const next = { ...prev };
          delete next[deleteTarget.id];
          return next;
        });
        toast.success(`Deleted section "${deleteTarget.title}"`);
      }
      setDeleteTarget(null);
      await router.invalidate();
    } catch {
      toast.error('Operation failed');
    } finally {
      setGlobalBusy(false);
    }
  };

  // Filtered list by search
  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return sectionsList;
    const q = searchQuery.toLowerCase().trim();
    return sectionsList.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.kicker && s.kicker.toLowerCase().includes(q)) ||
        (s.main_heading && s.main_heading.toLowerCase().includes(q))
    );
  }, [sectionsList, searchQuery]);

  const enabledCount = sectionsList.filter((s) => Boolean(formData[s.id]?.is_enabled)).length;

  return (
    <AdminLayout
      title="Section Headings &amp; Small Titles"
      description="Customize the small title (kicker badge), font size, font family, colors, icons, and visibility for every landing page section."
      email={session.email}
      crumbs={[{ label: 'Section Headings' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Add Section
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 size-4" /> Preview Live Site
            </a>
          </Button>
        </div>
      }
    >
      {/* Search & Bulk Controls Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections by name, ID, or kicker..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
            <Badge variant="outline" className="font-mono text-xs">
              {enabledCount} / {sectionsList.length} Active
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={expandAll} title="Expand all section cards">
            <Maximize2 className="mr-1 size-3.5" /> Expand All
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll} title="Collapse all section cards">
            <Minimize2 className="mr-1 size-3.5" /> Collapse All
          </Button>
        </div>
      </div>

      {/* Sections Accordion List */}
      <div className="space-y-4">
        {filteredSections.map((sec, index) => {
          const data = formData[sec.id] || sec;
          const isOpen = Boolean(openSections[sec.id]);
          const isEnabled = Boolean(data.is_enabled);
          const isBusy = Boolean(busyIds[sec.id]);
          const IconComp = ICON_MAP[data.kicker_icon?.toLowerCase() || ''] || Sparkles;

          return (
            <Card
              key={sec.id}
              className={`border-border/80 transition-all duration-200 shadow-sm ${
                !isEnabled ? 'opacity-85 border-dashed bg-muted/20' : 'bg-card'
              }`}
            >
              {/* Collapsible Card Header Bar */}
              <div
                onClick={() => toggleAccordion(sec.id)}
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs text-muted-foreground font-semibold">
                    #{index + 1}
                  </span>

                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconComp className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                        {data.title}
                      </h3>
                      <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                        {sec.id}
                      </Badge>
                      {isEnabled ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Visible
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                          Hidden
                        </Badge>
                      )}
                      {Boolean(data.is_collapsible) && (
                        <Badge variant="outline" className="border-purple-500/40 text-purple-400 text-[10px]">
                          Collapsible{Boolean(data.default_collapsed) ? ' • Closed' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-md hidden sm:block">
                      {sec.description || 'Landing page section'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {/* Live Mini Preview of Small Title Badge */}
                  <div className="hidden lg:block">
                    <SectionBadge
                      section={data}
                      kicker={data.kicker || 'TITLE'}
                      className="!mb-0"
                    />
                  </div>

                  {/* Enable / Disable Switch */}
                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                    title={isEnabled ? 'Click to hide from site' : 'Click to show on site'}
                  >
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToggleEnabled(sec, { stopPropagation: () => {} } as React.MouseEvent)}
                    />
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded Card Body */}
              {isOpen && (
                <CardContent className="border-t border-border/60 p-4 sm:p-6 space-y-6">
                  {/* Live Preview Display Box (Dark Cosmic Canvas mockup) */}
                  <div className="rounded-xl border border-border/80 bg-[#0d0914] p-5 sm:p-7 relative overflow-hidden shadow-inner">
                    <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-purple-900/10 via-transparent to-transparent" />
                    <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1.5">
                        <Eye className="size-3.5 text-primary" /> Live Section Header Preview (As seen on site)
                      </span>
                      <div className="flex items-center gap-2">
                        {Boolean(data.is_collapsible) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Collapsible {Boolean(data.default_collapsed) ? '(Starts Closed)' : '(Starts Open)'}
                          </span>
                        )}
                        <span>ID: {sec.id}</span>
                      </div>
                    </div>

                    <div className="text-left relative z-10 py-2">
                      <SectionBadge section={data} kicker={data.kicker || 'SMALL TITLE'} />
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        {data.main_heading || 'Main Heading'}{' '}
                        <span className="gradient-text-purple">
                          {data.highlight_text || 'Gradient Text'}
                        </span>
                      </h2>
                      {data.subtitle && (
                        <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl leading-relaxed">
                          {data.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tabs for Organization: Badge / Headings / Settings */}
                  <Tabs defaultValue="badge" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                      <TabsTrigger value="badge" className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="size-3.5" /> Small Title (Badge)
                      </TabsTrigger>
                      <TabsTrigger value="heading" className="flex items-center gap-1.5 text-xs">
                        <Type className="size-3.5" /> Headings &amp; Copy
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="flex items-center gap-1.5 text-xs">
                        <Sliders className="size-3.5" /> Visibility &amp; Order
                      </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: Small Title Badge Customizer */}
                    <TabsContent value="badge" className="space-y-5 pt-4">
                      {/* Badge Text & Visibility Toggle */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Small Title Text (Kicker)</Label>
                          <Input
                            value={data.kicker ?? ''}
                            onChange={(e) => updateField(sec.id, 'kicker', e.target.value)}
                            placeholder="e.g. FEATURED WORK"
                            className="text-xs font-medium"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            The uppercase pill label above the main section title.
                          </p>
                        </div>

                        <div className="space-y-1.5 flex flex-col justify-end">
                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <Label className="text-xs font-semibold">Show Small Title Badge</Label>
                              <p className="text-[11px] text-muted-foreground">
                                Toggle visibility of the small title for this section.
                              </p>
                            </div>
                            <Switch
                              checked={Boolean(data.kicker_enabled)}
                              onCheckedChange={(checked) =>
                                updateField(sec.id, 'kicker_enabled', checked ? 1 : 0)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Icon / Logo Selection */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Badge Icon</Label>
                          <select
                            value={data.kicker_icon || 'sparkles'}
                            onChange={(e) => updateField(sec.id, 'kicker_icon', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {SECTION_ICONS.map((icon) => (
                              <option key={icon.value} value={icon.value}>
                                {icon.label}
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-muted-foreground">
                            Pick an icon or select &quot;No Icon&quot; for text-only.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Custom Image / Logo URL (Optional)</Label>
                          <Input
                            value={data.kicker_logo_url ?? ''}
                            onChange={(e) => updateField(sec.id, 'kicker_logo_url', e.target.value)}
                            placeholder="e.g. /uploads/img-logo.png"
                            className="text-xs font-mono"
                          />
                          <p className="text-[11px] text-muted-foreground">
                            If set, replaces the Lucide icon with a custom miniature image logo.
                          </p>
                        </div>
                      </div>

                      {/* Color Palette Presets */}
                      <div className="space-y-2 rounded-lg border border-border/70 p-4 bg-muted/10">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <Palette className="size-3.5 text-primary" /> One-Click Color Presets
                        </Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {BADGE_COLOR_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => applyColorPreset(sec.id, preset)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105"
                              style={{
                                color: preset.textColor,
                                backgroundColor: preset.bgColor,
                                borderColor: preset.borderColor,
                              }}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: preset.iconColor }}
                              />
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Color Pickers */}
                      <div className="grid gap-3 sm:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Text Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                data.kicker_text_color?.startsWith('#')
                                  ? data.kicker_text_color
                                  : '#f59e0b'
                              }
                              onChange={(e) => updateField(sec.id, 'kicker_text_color', e.target.value)}
                              className="size-7 rounded cursor-pointer border bg-transparent"
                            />
                            <Input
                              value={data.kicker_text_color ?? ''}
                              onChange={(e) => updateField(sec.id, 'kicker_text_color', e.target.value)}
                              placeholder="e.g. #fbbf24"
                              className="text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Pill Background</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                data.kicker_bg_color?.startsWith('#')
                                  ? data.kicker_bg_color
                                  : '#1f1607'
                              }
                              onChange={(e) => updateField(sec.id, 'kicker_bg_color', e.target.value)}
                              className="size-7 rounded cursor-pointer border bg-transparent"
                            />
                            <Input
                              value={data.kicker_bg_color ?? ''}
                              onChange={(e) => updateField(sec.id, 'kicker_bg_color', e.target.value)}
                              placeholder="e.g. rgba(245, 158, 11, 0.1)"
                              className="text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Pill Border</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                data.kicker_border_color?.startsWith('#')
                                  ? data.kicker_border_color
                                  : '#78350f'
                              }
                              onChange={(e) => updateField(sec.id, 'kicker_border_color', e.target.value)}
                              className="size-7 rounded cursor-pointer border bg-transparent"
                            />
                            <Input
                              value={data.kicker_border_color ?? ''}
                              onChange={(e) => updateField(sec.id, 'kicker_border_color', e.target.value)}
                              placeholder="e.g. rgba(245, 158, 11, 0.25)"
                              className="text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Icon Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={
                                data.kicker_icon_color?.startsWith('#')
                                  ? data.kicker_icon_color
                                  : '#f59e0b'
                              }
                              onChange={(e) => updateField(sec.id, 'kicker_icon_color', e.target.value)}
                              className="size-7 rounded cursor-pointer border bg-transparent"
                            />
                            <Input
                              value={data.kicker_icon_color ?? ''}
                              onChange={(e) => updateField(sec.id, 'kicker_icon_color', e.target.value)}
                              placeholder="e.g. #f59e0b"
                              className="text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Typography Customization */}
                      <div className="grid gap-3 sm:grid-cols-4 pt-1">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Font Size</Label>
                          <select
                            value={data.kicker_font_size || '0.75rem'}
                            onChange={(e) => updateField(sec.id, 'kicker_font_size', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {FONT_SIZE_OPTIONS.map((f) => (
                              <option key={f.value} value={f.value}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Font Family</Label>
                          <select
                            value={data.kicker_font_family || 'mono'}
                            onChange={(e) =>
                              updateField(sec.id, 'kicker_font_family', e.target.value as 'mono' | 'sans' | 'heading')
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {FONT_FAMILY_OPTIONS.map((ff) => (
                              <option key={ff.value} value={ff.value}>
                                {ff.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Font Weight</Label>
                          <select
                            value={data.kicker_font_weight || '600'}
                            onChange={(e) => updateField(sec.id, 'kicker_font_weight', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {FONT_WEIGHT_OPTIONS.map((w) => (
                              <option key={w.value} value={w.value}>
                                {w.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium">Text Transform</Label>
                          <select
                            value={data.kicker_text_transform || 'uppercase'}
                            onChange={(e) =>
                              updateField(
                                sec.id,
                                'kicker_text_transform',
                                e.target.value as 'uppercase' | 'capitalize' | 'none'
                              )
                            }
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {TEXT_TRANSFORM_OPTIONS.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </TabsContent>

                    {/* TAB 2: Headings & Subtitle */}
                    <TabsContent value="heading" className="space-y-4 pt-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Main Heading Text</Label>
                          <Input
                            value={data.main_heading ?? ''}
                            onChange={(e) => updateField(sec.id, 'main_heading', e.target.value)}
                            placeholder="e.g. Case Studies &"
                            className="text-xs font-medium"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Highlighted Text (Purple Gradient)</Label>
                          <Input
                            value={data.highlight_text ?? ''}
                            onChange={(e) => updateField(sec.id, 'highlight_text', e.target.value)}
                            placeholder="e.g. Real Results"
                            className="text-xs text-primary font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Introductory Subtitle Paragraph</Label>
                        <Textarea
                          rows={2}
                          value={data.subtitle ?? ''}
                          onChange={(e) => updateField(sec.id, 'subtitle', e.target.value)}
                          placeholder="Supporting sentence below the main heading..."
                          className="text-xs leading-relaxed"
                        />
                      </div>
                    </TabsContent>

                    {/* TAB 3: Visibility & Order */}
                    <TabsContent value="settings" className="space-y-4 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Admin Display Title</Label>
                          <Input
                            value={data.title}
                            onChange={(e) => updateField(sec.id, 'title', e.target.value)}
                            placeholder="e.g. Featured Case Studies"
                            className="text-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold">Sort Order Index</Label>
                          <Input
                            type="number"
                            value={data.sort_order ?? 0}
                            onChange={(e) =>
                              updateField(sec.id, 'sort_order', parseInt(e.target.value, 10) || 0)
                            }
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                        <div>
                          <Label className="text-xs font-semibold">Section Visibility Status</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            When enabled, this section is published on the live landing page. When
                            disabled, it is completely hidden from visitors.
                          </p>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => updateField(sec.id, 'is_enabled', checked ? 1 : 0)}
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
                        <div>
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Minimize2 className="size-3.5 text-primary" /> Make Section Collapsible on Landing Page
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Allows website visitors to collapse this section into a compact summary card to reduce page length.
                          </p>
                        </div>
                        <Switch
                          checked={Boolean(data.is_collapsible)}
                          onCheckedChange={(checked) => updateField(sec.id, 'is_collapsible', checked ? 1 : 0)}
                        />
                      </div>

                      {Boolean(data.is_collapsible) && (
                        <div className="flex items-center justify-between rounded-lg border border-primary/30 p-4 bg-primary/5 ml-3">
                          <div>
                            <Label className="text-xs font-semibold">Collapsed by Default on Page Load</Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              When visitors load the homepage, this section will start collapsed with an &quot;Expand Section&quot; button, keeping the landing page compact.
                            </p>
                          </div>
                          <Switch
                            checked={Boolean(data.default_collapsed)}
                            onCheckedChange={(checked) => updateField(sec.id, 'default_collapsed', checked ? 1 : 0)}
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Actions for this section */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(data)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                    >
                      <RotateCcw className="mr-1.5 size-3.5" />
                      {DEFAULT_LANDING_SECTIONS.some((d) => d.id === sec.id)
                        ? 'Reset to Defaults'
                        : 'Delete Section'}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleSaveSection(sec.id)}
                    >
                      {isBusy ? 'Saving...' : 'Save Section'}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 mt-8 flex items-center justify-between border-t bg-background/95 p-4 backdrop-blur z-20 shadow-lg rounded-t-lg">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-mono">
            {sectionsList.length} Sections
          </Badge>
          <span>All edits sync to live landing page &amp; database</span>
        </div>
        <Button size="lg" disabled={globalBusy} onClick={handleSaveAll} className="shadow-md">
          {globalBusy ? 'Saving All...' : 'Save All Changes'}
        </Button>
      </div>

      {/* ADD SECTION DIALOG (CRUD - Create) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Landing Section</DialogTitle>
            <DialogDescription>
              Create a new section configuration for the portfolio landing page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Section ID (Slug) *</Label>
              <Input
                value={newSection.id}
                onChange={(e) =>
                  setNewSection((prev) => ({
                    ...prev,
                    id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
                  }))
                }
                placeholder="e.g. advisory_work"
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Unique identifier used by the template (letters, numbers, underscores).
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Display Title *</Label>
              <Input
                value={newSection.title}
                onChange={(e) => setNewSection((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Strategic Advisory & Consulting"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Small Title (Badge Kicker)</Label>
              <Input
                value={newSection.kicker}
                onChange={(e) => setNewSection((prev) => ({ ...prev, kicker: e.target.value }))}
                placeholder="e.g. ADVISORY"
                className="text-xs"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Main Heading</Label>
                <Input
                  value={newSection.main_heading}
                  onChange={(e) =>
                    setNewSection((prev) => ({ ...prev, main_heading: e.target.value }))
                  }
                  placeholder="e.g. Executive"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Highlight Text</Label>
                <Input
                  value={newSection.highlight_text}
                  onChange={(e) =>
                    setNewSection((prev) => ({ ...prev, highlight_text: e.target.value }))
                  }
                  placeholder="e.g. Advisory"
                  className="text-xs text-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Subtitle Description</Label>
              <Textarea
                rows={2}
                value={newSection.subtitle}
                onChange={(e) => setNewSection((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Supporting description paragraph..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/10">
              <div>
                <Label className="text-xs font-semibold">Make Section Collapsible</Label>
                <p className="text-[11px] text-muted-foreground">
                  Adds expand/collapse controls on the landing page.
                </p>
              </div>
              <Switch
                checked={Boolean(newSection.is_collapsible)}
                onCheckedChange={(checked) =>
                  setNewSection((prev) => ({ ...prev, is_collapsible: checked ? 1 : 0 }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={globalBusy} onClick={handleCreateSection}>
              {globalBusy ? 'Creating...' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE / RESET DIALOG (CRUD - Delete) */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {deleteTarget && DEFAULT_LANDING_SECTIONS.some((d) => d.id === deleteTarget.id)
                ? 'Reset Section to Defaults?'
                : 'Delete Section?'}
            </DialogTitle>
            <DialogDescription>
              {deleteTarget && DEFAULT_LANDING_SECTIONS.some((d) => d.id === deleteTarget.id)
                ? `This will restore the original default kicker, colors, font styling, and titles for "${deleteTarget?.title}". Your content can be re-customized at any time.`
                : `Are you sure you want to delete "${deleteTarget?.title}"? This section will be removed permanently.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={globalBusy}
              onClick={handleConfirmDelete}
            >
              {deleteTarget && DEFAULT_LANDING_SECTIONS.some((d) => d.id === deleteTarget.id)
                ? 'Reset to Defaults'
                : 'Delete Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export const Route = createFileRoute('/admin/sections')({
  loader: async () => {
    const [session, sections] = await Promise.all([
      requireAdminSession(),
      adminListLandingSections(),
    ]);
    return { session, sections };
  },
  head: () => ({
    meta: [
      { title: 'Section Headings & Small Titles | Content Studio' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: SectionsAdminPage,
});
