import { History, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RevisionSummary } from '@/lib/cms/content.types';

interface RevisionHistoryProps {
  revisions: RevisionSummary[];
  restoring?: boolean;
  onRestore: (id: number) => Promise<void>;
}

export default function RevisionHistory({ revisions, restoring = false, onRestore }: RevisionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><History className="size-4" /> Revision history</CardTitle>
        <CardDescription>A snapshot is saved before every update.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {revisions.length === 0 && <p className="text-sm text-muted-foreground">No previous revisions yet.</p>}
        {revisions.map((revision) => (
          <div key={revision.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <span className="text-sm">{new Date(revision.created_at).toLocaleString()}</span>
            <Button type="button" variant="outline" size="sm" disabled={restoring} onClick={() => void onRestore(revision.id)}>
              <RotateCcw className="size-3.5" /> Restore
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}