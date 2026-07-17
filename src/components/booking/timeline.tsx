import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { BookingStatus } from "@prisma/client";

type HistoryItem = {
  id: string;
  status: BookingStatus;
  note: string | null;
  createdAt: Date;
};

export function BookingTimeline({ history }: { history: HistoryItem[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Booking Timeline</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`h-3 w-3 rounded-full ${index === history.length - 1 ? "bg-brand" : "bg-brand/40"}`} />
                {index < history.length - 1 && <div className="w-0.5 flex-1 bg-border min-h-8" />}
              </div>
              <div className="pb-4">
                <div className="font-medium text-sm">{item.status.replace("_", " ")}</div>
                {item.note && <div className="text-sm text-muted-foreground">{item.note}</div>}
                <div className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
