import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type TimelineItem = {
  id: string;
  statusLabel: string;
  note: string | null;
  dateLabel: string;
  isLatest: boolean;
};

export function BookingTimeline({ history }: { history: TimelineItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Booking Timeline</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full ${item.isLatest ? "bg-brand" : "bg-brand/40"}`} />
                {!item.isLatest && <div className="w-0.5 flex-1 bg-border min-h-8" />}
              </div>
              <div className="pb-4">
                <div className="font-medium text-sm">{item.statusLabel}</div>
                {item.note && <div className="text-sm text-muted-foreground">{item.note}</div>}
                <div className="text-xs text-muted-foreground">{item.dateLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
