import type { Shipment, TrackingEvent } from "@/types";
import { formatDistanceToNow } from "date-fns";

type Props = {
  shipment: Shipment & { latest_event?: TrackingEvent | null };
};

const statusColor = (status: string) => {
  if (/hold|delay|exception/i.test(status)) return "bg-accent-critical/20 text-accent-critical border-accent-critical/60";
  if (/warning|pending/i.test(status)) return "bg-accent-warning/20 text-accent-warning border-accent-warning/60";
  return "bg-accent-success/20 text-accent-success border-accent-success/60";
};

export function LiveStatusCard({ shipment }: Props) {
  return (
    <div className="glass-panel grid-accent rounded-xl border border-slate-800 p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Shipment</p>
          <h3 className="text-xl font-semibold">{shipment.external_ref || shipment.id}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${statusColor(shipment.current_status)}`}>
          {shipment.current_status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-text-secondary">
        <div>
          <p className="text-text-secondary">Location</p>
          <p className="text-text-primary">{shipment.current_location || "Unknown"}</p>
        </div>
        <div>
          <p className="text-text-secondary">Delay</p>
          <p className="text-text-primary">
            {shipment.delay_duration_hours ? `${shipment.delay_duration_hours} hrs` : "On schedule"}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-background-primary/60 p-3">
        <p className="text-xs uppercase tracking-wide text-accent-knowledge">Live Event</p>
        <p className="text-text-primary">
          {shipment.latest_event?.event_description || "No recent events"}
        </p>
        <p className="text-xs text-text-secondary">
          {shipment.latest_event?.event_timestamp
            ? formatDistanceToNow(new Date(shipment.latest_event.event_timestamp), { addSuffix: true })
            : "n/a"}
        </p>
      </div>
    </div>
  );
}

