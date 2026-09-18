import * as React from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Columns3, Inbox } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: string;
  header: string;
  /** Value used for sorting and search. */
  value?: (row: T) => string | number;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  /** Hidden on small screens. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => React.ReactNode;
}

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchPlaceholder = 'Search…',
  filters,
  pageSize = 10,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Create your first item to see it listed here.',
  emptyAction,
  selectable = false,
  bulkActions,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [sort, setSort] = React.useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = React.useState(1);
  const [hidden, setHidden] = React.useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = React.useState<Array<string | number>>([]);

  const visibleColumns = columns.filter((column) => !hidden.includes(column.key));

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      columns.some((column) => String(column.value?.(row) ?? '').toLowerCase().includes(term)),
    );
  }, [rows, search, columns]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.value) return filtered;
    return [...filtered].sort((a, b) => {
      const av = column.value?.(a) ?? '';
      const bv = column.value?.(b) ?? '';
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? result : -result;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selected = rows.filter((row) => selectedKeys.includes(rowKey(row)));
  const pageKeys = pageRows.map(rowKey);
  const allPageSelected = pageKeys.length > 0 && pageKeys.every((key) => selectedKeys.includes(key));

  function toggleSort(key: string) {
    setSort((current) =>
      current?.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="h-9 w-full sm:max-w-xs"
        />
        {filters}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto gap-2">
              <Columns3 className="size-4" />
              <span className="hidden sm:inline">Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={!hidden.includes(column.key)}
                onCheckedChange={(checked) =>
                  setHidden((current) =>
                    checked ? current.filter((key) => key !== column.key) : [...current, column.key],
                  )
                }
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectable && selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-sm font-medium">{selected.length} selected</span>
          {bulkActions?.(selected, () => setSelectedKeys([]))}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelectedKeys([])}>Clear</Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={allPageSelected}
                    aria-label="Select visible rows"
                    onCheckedChange={(checked) =>
                      setSelectedKeys((current) => checked
                        ? [...new Set([...current, ...pageKeys])]
                        : current.filter((key) => !pageKeys.includes(key)))
                    }
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key}
                  className={[column.className, column.hideOnMobile ? 'hidden md:table-cell' : ''].join(' ')}
                >
                  {column.sortable && column.value ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-foreground"
                    >
                      {column.header}
                      {sort?.key === column.key ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {selectable && <TableCell><Skeleton className="size-4" /></TableCell>}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.key} className={column.hideOnMobile ? 'hidden md:table-cell' : ''}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!loading && pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0)} className="py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <Inbox className="size-6 text-muted-foreground" />
                    <p className="font-medium">{emptyTitle}</p>
                    <p className="text-sm text-muted-foreground">{emptyDescription}</p>
                    {emptyAction}
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              pageRows.map((row) => (
                <TableRow key={rowKey(row)}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedKeys.includes(rowKey(row))}
                        aria-label="Select row"
                        onCheckedChange={(checked) => setSelectedKeys((current) => checked
                          ? [...current, rowKey(row)]
                          : current.filter((key) => key !== rowKey(row)))}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={[column.className, column.hideOnMobile ? 'hidden md:table-cell' : ''].join(' ')}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          {sorted.length} item{sorted.length === 1 ? '' : 's'}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
            Previous
          </Button>
          <span>
            Page {currentPage} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
