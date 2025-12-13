import type { VectorSearchResult } from "@/types";

type Props = {
  citations?: VectorSearchResult[];
};

export function PolicyCitation({ citations }: Props) {
  if (!citations || citations.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-background-primary/70 p-4">
        <p className="text-sm text-text-secondary">No policy citations available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-accent-knowledge/30 bg-background-primary/80 p-4 shadow-glow">
      <p className="text-xs uppercase tracking-wide text-accent-knowledge">Policy citations</p>
      <div className="mt-3 space-y-3">
        {citations.map((c) => (
          <div key={c.document_id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">Contract #{c.contract_id}</span>
              <span className="text-xs text-text-secondary">relevance {(c.similarity * 100).toFixed(1)}%</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-primary">{c.content_text}</p>
            {c.metadata ? (
              <p className="mt-1 text-xs text-accent-knowledge">
                {c.metadata["page"] ? `Page ${c.metadata["page"]} · ` : ""}
                {c.metadata["clause"] ? `Clause ${c.metadata["clause"]}` : ""}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

