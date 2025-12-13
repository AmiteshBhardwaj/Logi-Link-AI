import type { Shipment, TrackingEvent } from "@/types";

export const mockShipments: (Shipment & { latest_event?: TrackingEvent })[] = [
  {
    id: 999001,
    organization_id: "00000000-0000-0000-0000-000000000000",
    external_ref: "LL-999001",
    current_status: "Customs Hold",
    current_location: "Frankfurt (FRA)",
    delay_duration_hours: 52,
    last_updated_at: new Date().toISOString(),
    associated_contract_id: 1001,
    latest_event: {
      id: 1,
      shipment_id: 999001,
      event_code: "CZ01",
      event_description: "Shipment held in customs inspection at FRA",
      event_timestamp: new Date(Date.now() - 52 * 60 * 60 * 1000).toISOString()
    }
  },
  {
    id: 999002,
    organization_id: "00000000-0000-0000-0000-000000000000",
    external_ref: "LL-999002",
    current_status: "In Transit",
    current_location: "Hamburg",
    delay_duration_hours: null,
    last_updated_at: new Date().toISOString(),
    associated_contract_id: 1001,
    latest_event: {
      id: 2,
      shipment_id: 999002,
      event_code: "MOV",
      event_description: "Departed port",
      event_timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  }
];

