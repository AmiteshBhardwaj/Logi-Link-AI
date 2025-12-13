"use client";

import { LiveStatusCard } from "@/components/dashboard/LiveStatusCard";
import { PolicyCitation } from "@/components/dashboard/PolicyCitation";
import { VoiceInputWidget } from "@/components/dashboard/VoiceInputWidget";
import { useHybridQuery } from "@/lib/hooks/useLogiData";
import { mockShipments } from "@/lib/db/mockData";
import type { Locale } from "@/types";

export default function DashboardPage() {
  const { result, loading, error, runQuery } = useHybridQuery();

  const submitQuery = async (query: string, language: Locale = "en") => {
    await runQuery({ query, shipmentId: 999001, language });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">Digital Dispatcher</p>
          <h1 className="text-3xl font-bold text-text-primary">Logi-Link AI Command Center</h1>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-text-secondary">
          Latency target &lt; 5s · Multilingual · RAG + SQL
        </div>
      </header>

      <VoiceInputWidget onSubmit={submitQuery} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl border border-slate-800 p-5 shadow-lg">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wide text-accent-knowledge">Hybrid Reasoner</p>
              <h2 className="text-xl font-semibold text-text-primary">SQL + Vector RAG Synthesis</h2>
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-background-primary/70 p-4">
              <p className="text-xs uppercase tracking-wide text-text-secondary">Answer</p>
              {loading ? (
                <p className="text-text-primary">Orchestrating logic...</p>
              ) : result ? (
                <p className="text-lg leading-relaxed text-text-primary">{result.answer}</p>
              ) : (
                <p className="text-text-secondary">Awaiting query.</p>
              )}

              {error ? (
                <div className="mt-2 rounded-lg border border-accent-critical/50 bg-accent-critical/10 p-3">
                  <p className="text-sm font-semibold text-accent-critical">Error: {error}</p>
                </div>
              ) : null}

              {result?.liveData ? (
                <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
                  <span className="rounded-full bg-accent-success/20 px-3 py-1 text-accent-success">Live Data</span>
                  <span>
                    Status: {result.liveData.current_status} · Location: {result.liveData.current_location}
                  </span>
                  <span>Delay: {result.liveData.delay_duration_hours ?? 0}h</span>
                </div>
              ) : null}
            </div>
          </div>

          <PolicyCitation citations={result?.citations} />
        </section>

        <section className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-text-secondary">Live Shipments</p>
          {mockShipments.map((s) => (
            <LiveStatusCard key={s.id} shipment={s} />
          ))}
        </section>
      </div>
    </div>
  );
}

