"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Error al registrar");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050810] font-mono">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm px-4">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/50 bg-violet-500/10">
            <span className="text-lg font-black text-violet-400">VX</span>
          </div>
          <h1 className="text-xl font-black tracking-widest text-white">VECTOR LAB</h1>
          <p className="mt-1 text-xs tracking-widest text-slate-600">NUEVO ACCESO</p>
        </div>

        <form
          onSubmit={handleRegister}
          className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 backdrop-blur"
        >
          <h2 className="mb-6 text-sm font-bold tracking-widest text-slate-400">
            CREAR CUENTA
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs tracking-widest text-slate-500">EMAIL</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs tracking-widest text-slate-500">CONTRASEÑA</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-violet-500 py-3 text-sm font-bold tracking-widest text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:opacity-50"
          >
            {loading ? "CREANDO..." : "REGISTRARSE →"}
          </button>

          <p className="mt-6 text-center text-xs text-slate-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-violet-400 transition hover:text-violet-300">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
