import * as React from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Upload, X, FileText, Check, Loader2, Image as ImageIcon, ExternalLink, Search } from 'lucide-react';
import { toast } from 'sonner';
import { adminUploadFile } from '@/lib/cms/upload.functions';
import { adminListMedia } from '@/lib/cms/content.functions';
import type { MediaItem } from '@/lib/cms/content.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ImageUploaderProps {
  id?: string;
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  help?: string;
  isPdf?: boolean;
  mediaLibraryItems?: Array<{ id: number; url: string; file_name: string; alt_text?: string }>;
}

export default function ImageUploader({
  id,
  label,
  value = '',
  onChange,
  accept = 'image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon',
  help,
  isPdf = false,
  mediaLibraryItems: externalItems,
}: ImageUploaderProps) {
  const uploadFn = useServerFn(adminUploadFile);
  const listMediaFn = useServerFn(adminListMedia);
  const [uploading, setUploading] = React.useState(false);
  const [showManual, setShowManual] = React.useState(false);
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [loadingLibrary, setLoadingLibrary] = React.useState(false);
  const [internalItems, setInternalItems] = React.useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isCurrentPdf = isPdf || value.toLowerCase().endsWith('.pdf');

  // Load media items from database when picker opens
  const fetchMediaItems = React.useCallback(async () => {
    if (externalItems && externalItems.length > 0) return;
    setLoadingLibrary(true);
    try {
      const items = await listMediaFn();
      setInternalItems(items);
    } catch {
      // ignore
    } finally {
      setLoadingLibrary(false);
    }
  }, [externalItems, listMediaFn]);

  React.useEffect(() => {
    if (libraryOpen) {
      void fetchMediaItems();
    }
  }, [libraryOpen, fetchMediaItems]);

  const activeItems = (externalItems && externalItems.length > 0) ? externalItems : internalItems;

  const filteredItems = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return activeItems;
    return activeItems.filter((item) =>
      item.file_name.toLowerCase().includes(q) || (item.alt_text && item.alt_text.toLowerCase().includes(q))
    );
  }, [activeItems, searchQuery]);

  async function handleFileSelect(file: File) {
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be under 15MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const result = await uploadFn({
          data: {
            name: file.name,
            type: file.type || 'application/octet-stream',
            base64,
            usageNote: label || 'Admin upload',
          },
        });

        if (result.ok && result.url) {
          onChange(result.url);
          toast.success(`Uploaded & saved to library: ${result.fileName || file.name}`);
          // Refresh library in background
          void fetchMediaItems();
        } else {
          toast.error(result.error || 'Upload failed');
        }
      } catch {
        toast.error('Failed to process and upload file');
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}

      {value ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card/60 p-3">
          <div className="flex items-center gap-3">
            {isCurrentPdf ? (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <FileText className="size-7" />
              </div>
            ) : (
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                <img src={value} alt="Preview" className="size-full object-contain" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-mono text-muted-foreground">{value}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="size-3 animate-spin mr-1" /> : <Upload className="size-3 mr-1" />}
                  Replace
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setLibraryOpen(true)}
                >
                  <ImageIcon className="size-3 mr-1" />
                  Library
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => onChange('')}
                >
                  <X className="size-3 mr-1" />
                  Remove
                </Button>

                <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                  <a href={value} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3 mr-1" /> View
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Uploading and saving to Media Library...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {isPdf ? <FileText className="size-5" /> : <Upload className="size-5" />}
              </div>
              <div className="text-xs flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Click to upload
                </button>
                <span className="text-muted-foreground">or drag &amp; drop, or</span>
                <button
                  type="button"
                  onClick={() => setLibraryOpen(true)}
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  select from Library
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isPdf ? 'PDF document up to 15MB' : 'PNG, SVG, JPG, WebP, or ICO up to 15MB'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Auxiliary actions: Media Library Picker Dialog & Manual URL Toggle */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
          <DialogTrigger asChild>
            <button type="button" className="inline-flex items-center gap-1 hover:text-foreground font-medium">
              <ImageIcon className="size-3.5 text-primary" /> Pick from Media Library
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" /> Media Library
              </DialogTitle>
              <DialogDescription>
                Select an existing image from your uploaded media library or click upload below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search media files by name..."
                  className="pl-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {loadingLibrary ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-muted-foreground">
                  <ImageIcon className="size-8 opacity-40 mb-2" />
                  <p>No media files found matching your search.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setLibraryOpen(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="size-3 mr-1.5" /> Upload new file
                  </Button>
                </div>
              ) : (
                <div className="grid max-h-[55vh] grid-cols-3 gap-3 overflow-y-auto p-1 sm:grid-cols-4 md:grid-cols-5">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onChange(item.url);
                        setLibraryOpen(false);
                        toast.success(`Selected ${item.file_name}`);
                      }}
                      className={`group relative aspect-square overflow-hidden rounded-md border text-left transition-all hover:border-primary ${
                        value === item.url ? 'border-primary ring-2 ring-primary/40' : 'border-border bg-muted/30'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.alt_text || item.file_name}
                        loading="lazy"
                        className="size-full object-contain p-2"
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
                        {item.file_name}
                      </span>
                      {value === item.url && (
                        <span className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground shadow">
                          <Check className="size-3" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setLibraryOpen(false);
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="size-3.5 mr-1.5" /> Upload File Instead
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setLibraryOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <button
          type="button"
          onClick={() => setShowManual((prev) => !prev)}
          className="ml-auto hover:text-foreground"
        >
          {showManual ? 'Hide URL input' : 'Enter URL manually'}
        </button>
      </div>

      {showManual && (
        <div className="mt-1">
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… or /uploads/…"
            className="h-8 text-xs font-mono"
          />
        </div>
      )}

      {help && <p className="text-[11px] text-muted-foreground">{help}</p>}
    </div>
  );
}
