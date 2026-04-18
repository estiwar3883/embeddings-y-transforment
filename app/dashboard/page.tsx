"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkerResponse } from "./worker";

type VectorResults = {
  id: string;
  phrase: string;
  geminiVector: number[];
  textEmbedVector: number[];
  similarity?: number;
};

type VectorsApiResponse = {
  id?: string;
  geminiVector?: number[];
  error?: string;
};

function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function VectorHeatmap({
  vector,
  color,
  label,
  dim,
}: {
  vector: number[];
  color: "sky" | "violet";
  label: string;
  dim: string;
}) {
  const preview = vector.slice(0, 128);
  const maxAbs = preview.length > 0 ? Math.max(...preview.map(Math.abs)) : 1;
  const colorPos = color === "sky" ? "rgba(56,189,248," : "rgba(139,92,246,";
  const barClass = color === "sky" ? "bg-sky-400" : "bg-violet-400";
  const textClass = color === "sky" ? "text-sky-400" : "text-violet-400";
  const borderClass = color === "sky" ? "border-sky-500/30" : "border-violet-500/30";

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${barClass}`} />
          <span className="text-xs font-bold tracking-widest text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className={`rounded-full border ${borderClass} px-2 py-0.5 ${textClass}`}>{dim}</span>
          <span>128 dims visibles</span>
        </div>
      </div>

      {/* Heatmap grid 32×4 */}
      <div className={`rounded-xl border ${borderClass} bg-[#0a0f1a] p-4`}>
        <p className="mb-3 text-[9px] tracking-widest text-slate-700">MAPA DE CALOR — PRIMERAS 128 DIMENSIONES</p>
        <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(32, 1fr)" }}>
          {preview.map((v, i) => {
            const intensity = maxAbs > 0 ? Math.abs(v) / maxAbs : 0;
            const isPos = v >= 0;
            return (
              <div
                key={i}
                title={`dim[${i}]: ${v.toFixed(4)}`}
                className="aspect-square rounded-sm cursor-default transition-opacity hover:opacity-80"
                style={{
                  backgroundColor: isPos
                    ? `${colorPos}${intensity})`
                    : `rgba(239,68,68,${intensity * 0.7})`,
                }}
              />
            );
          })}
        </div>

        {/* Bar sparklines — first 32 dims */}
        <div className="mt-4 space-y-0.5">
          <p className="mb-1 text-[9px] tracking-widest text-slate-700">MAGNITUD POR DIMENSIÓN (primeras 32)</p>
          {vector.slice(0, 32).map((v, i) => (
            <div key={i} className="flex h-1 w-full items-center gap-0.5">
              <div
                className={`h-full rounded-sm ${barClass} ${v < 0 ? "opacity-50" : "opacity-100"}`}
                style={{ width: `${Math.min(Math.abs(v) * 100, 100)}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: "MIN", value: vector.length > 0 ? Math.min(...vector).toFixed(3) : "—" },
          { label: "MAX", value: vector.length > 0 ? Math.max(...vector).toFixed(3) : "—" },
          {
            label: "μ",
            value:
              vector.length > 0
                ? (vector.reduce((a, b) => a + b, 0) / vector.length).toFixed(4)
                : "—",
          },
          { label: "DIMS", value: vector.length.toString() },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-slate-900/50 px-2 py-2">
            <div className="text-[9px] tracking-widest text-slate-600">{s.label}</div>
            <div className={`text-sm font-bold ${textClass}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Raw values */}
      <details className="group">
        <summary className="cursor-pointer select-none text-xs tracking-widest text-slate-600 transition hover:text-slate-400">
          VER TODOS LOS VALORES ({vector.length}) ▶
        </summary>
        <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-[#050810] p-4">
          <pre className={`text-[9px] leading-4 ${textClass} opacity-70`}>
            {JSON.stringify(vector, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

export default function Dashboard() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<VectorResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState<VectorResults[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<{ geminiVector: number[]; id: string; phrase: string } | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url));

    worker.onmessage = async (event: MessageEvent<WorkerResponse>) => {
      if (event.data.status === "error") {
        pendingRef.current = null;
        setStatus(`✗ Error en worker: ${event.data.message}`);
        setLoading(false);
        return;
      }

      const pending = pendingRef.current;
      if (!pending) {
        setStatus("✗ No se recibió el vector de Gemini.");
        setLoading(false);
        return;
      }

      const localVec = event.data.output!;
      const sim = cosineSimilarity(pending.geminiVector, localVec);

      // Guardar vector local en Neon via PATCH
      try {
        await fetch("/api/vectors", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pending.id, textEmbedVector: localVec }),
        });
      } catch {
        // No crítico si falla el guardado del vector local
        console.warn("No se pudo guardar el vector local en DB");
      }

      const result: VectorResults = {
        id: pending.id,
        phrase: pending.phrase,
        geminiVector: pending.geminiVector,
        textEmbedVector: localVec,
        similarity: sim,
      };

      setResults(result);
      setHistory((prev) => [result, ...prev.slice(0, 4)]);
      pendingRef.current = null;
      setLoading(false);
      setStatus("");
    };

    worker.onerror = () => {
      pendingRef.current = null;
      setStatus("✗ Error crítico en el worker local.");
      setLoading(false);
    };

    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const processText = async () => {
    const phrase = input.trim();
    if (!phrase || !workerRef.current || loading) return;

    setLoading(true);
    setResults(null);
    setStatus("⟳ Consultando Gemini API...");
    pendingRef.current = null;

    try {
      const res = await fetch("/api/vectors", {
        method: "POST",
        body: JSON.stringify({ phrase }),
        headers: { "Content-Type": "application/json" },
      });

      const data = (await res.json()) as VectorsApiResponse;

      if (!res.ok || !data.geminiVector || !data.id) {
        throw new Error(data.error ?? "No se pudo generar el vector con Gemini.");
      }

      pendingRef.current = {
        geminiVector: data.geminiVector,
        id: data.id,
        phrase,
      };

      setStatus("⟳ Calculando embedding local con MiniLM-L6 (Transformers.js)...");
      workerRef.current.postMessage({ text: phrase });
    } catch (error) {
      pendingRef.current = null;
      setLoading(false);
      setStatus(`✗ ${error instanceof Error ? error.message : "Error en el proceso"}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) processText();
  };

  return (
    <div className="min-h-screen bg-[#050810] font-mono text-white">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.025) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 border-b border-slate-800 pb-6">
          <p className="mb-1 text-xs tracking-widest text-slate-600">// VECTOR EMBEDDING LAB</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                <span className="text-sky-400">Gemini</span>
                <span className="mx-3 text-slate-700">vs</span>
                <span className="text-violet-400">MiniLM-L6</span>
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Cloud (768 dims) vs Local Browser (384 dims) — guardado en Neon PostgreSQL
              </p>
            </div>
            {results?.similarity !== undefined && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-3 text-right">
                <p className="text-[9px] tracking-widest text-slate-600">SIMILITUD COSENO</p>
                <p
                  className={`text-3xl font-black ${
                    results.similarity > 0.8
                      ? "text-green-400"
                      : results.similarity > 0.5
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {(results.similarity * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <p className="mb-3 text-[9px] tracking-widest text-slate-600">FRASE A VECTORIZAR</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 select-none">›</span>
              <input
                className="w-full rounded-xl border border-slate-700 bg-[#0a0f1a] py-4 pl-8 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/10"
                placeholder='Escribe una frase... (Enter para enviar)'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
            </div>
            <button
              onClick={processText}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-sky-500 px-8 text-sm font-bold tracking-widest text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                  ...
                </span>
              ) : (
                "VECTORIZAR"
              )}
            </button>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-xs tracking-wide ${
              status.startsWith("✗")
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-sky-500/20 bg-sky-500/5 text-sky-400"
            }`}
          >
            {loading && !status.startsWith("✗") && (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-sky-400 border-t-transparent" />
            )}
            {status}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Phrase + DB indicator */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs tracking-widest text-slate-600">FRASE:</span>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1 text-sm text-white">
                &ldquo;{results.phrase}&rdquo;
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Guardado en Neon
              </span>
            </div>

            {/* Similarity bar */}
            {results.similarity !== undefined && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="tracking-widest text-slate-600">SIMILITUD COSENO ENTRE MODELOS</span>
                  <span
                    className={`font-bold ${
                      results.similarity > 0.8
                        ? "text-green-400"
                        : results.similarity > 0.5
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {(results.similarity * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      results.similarity > 0.8
                        ? "bg-green-400"
                        : results.similarity > 0.5
                        ? "bg-yellow-400"
                        : "bg-red-400"
                    }`}
                    style={{ width: `${results.similarity * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  {results.similarity > 0.8
                    ? "Alta concordancia — ambos modelos entienden la frase de forma similar"
                    : results.similarity > 0.5
                    ? "Concordancia moderada — los modelos difieren en algunos aspectos semánticos"
                    : "Baja concordancia — los modelos representan el texto de forma muy distinta"}
                </p>
              </div>
            )}

            {/* Vector visualizations side by side */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <VectorHeatmap
                vector={results.geminiVector}
                color="sky"
                label="GEMINI TEXT-EMBEDDING-004"
                dim="768 dims"
              />
              <VectorHeatmap
                vector={results.textEmbedVector}
                color="violet"
                label="ALL-MINILM-L6-V2 (LOCAL)"
                dim="384 dims"
              />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="mt-12 border-t border-slate-800 pt-8">
            <p className="mb-4 text-[9px] tracking-widest text-slate-600">HISTORIAL DE SESIÓN</p>
            <div className="space-y-2">
              {history.slice(1).map((h, i) => (
                <button
                  key={h.id}
                  onClick={() => setResults(h)}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-700">{i + 2}.</span>
                    <span className="text-sm text-slate-400">&ldquo;{h.phrase}&rdquo;</span>
                  </div>
                  {h.similarity !== undefined && (
                    <span
                      className={`text-xs font-bold ${
                        h.similarity > 0.8
                          ? "text-green-400"
                          : h.similarity > 0.5
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {(h.similarity * 100).toFixed(1)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
