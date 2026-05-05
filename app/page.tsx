import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050810] font-mono">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-500/10 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between border-b border-sky-900/30 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-500/50 bg-sky-500/10">
            <span className="text-xs font-bold text-sky-400">ES</span>
          </div>
          <span className="text-sm font-bold tracking-widest text-white">VECTOR EST</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-xs tracking-widest text-slate-400 transition hover:text-sky-400">
            LOGIN
          </Link>
          <Link
            href="/register"
            className="rounded border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-xs font-bold tracking-widest text-sky-400 transition hover:bg-sky-500/20"
          >
            REGISTRO
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-8 py-32 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/5 px-4 py-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          <span className="text-xs tracking-widest text-sky-400">SISTEMA ACTIVO — GEMINI + TRANSFORMERS.JS</span>
        </div>

        <h1 className="mb-4 max-w-3xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
          Visualiza la{" "}
          <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
            Semántica
          </span>
        </h1>
        <p className="mb-4 text-lg text-slate-500 md:text-xl">de tus frases en tiempo real</p>

        <p className="mb-12 max-w-xl text-sm leading-relaxed text-slate-500">
          Compara embeddings generados por{" "}
          <span className="text-sky-400">Gemini text-embedding-004</span> en la nube contra{" "}
          <span className="text-violet-400">MiniLM-L6-v2</span> corriendo localmente en tu navegador con Transformers.js.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-sky-500 px-8 py-4 text-sm font-bold tracking-widest text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
          >
            EMPEZAR AHORA →
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-8 py-4 text-sm font-bold tracking-widest text-slate-400 transition hover:border-sky-500/50 hover:text-sky-400"
          >
            YA TENGO CUENTA
          </Link>
        </div>

        <div className="mt-24 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              icon: "☁️",
              title: "Gemini Cloud",
              desc: "Embeddings de 768 dimensiones generados por Google AI con text-embedding-004",
            },
            {
              icon: "⚡",
              title: "Local Browser",
              desc: "Inferencia 100% offline en tu navegador via Web Worker con @xenova/transformers",
            },
            {
              icon: "📊",
              title: "Comparativa",
              desc: "Visualiza y compara ambos vectores semánticos en tiempo real",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left backdrop-blur"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-2 text-sm font-bold tracking-widest text-white">{f.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
