"use client";

import { useEffect, useState } from "react";

function measureLatency(): Promise<number> {
  const start = performance.now();
  return fetch("/api/health")
    .then(() => Math.round(performance.now() - start))
    .catch(() => -1);
}

export function LatencyCard() {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function measure() {
      const ms = await measureLatency();
      if (mounted) setLatency(ms);
    }

    measure();
    const intervalId = setInterval(measure, 30_000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="bg-surface rounded-xl border border-border p-5 sm:p-6">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        Latency
      </p>

      <p className="mt-3 text-3xl font-light tracking-tight tabular-nums text-foreground">
        {latency === null || latency < 0 ? (
          <span className="text-muted">&mdash;</span>
        ) : (
          <>
            {latency}{" "}
            <span className="text-base font-normal text-muted">ms</span>
          </>
        )}
      </p>
    </div>
  );
}
