"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-[#070c14] px-6 py-3">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sky-500/40 bg-sky-500/10">
          <span className="text-xs font-black text-sky-400">VX</span>
        </div>
        <span className="text-sm font-bold tracking-widest text-white">VECTOR LAB</span>
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="rounded-md px-3 py-1.5 text-xs tracking-widest text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
        >
          INICIO
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md bg-sky-500/10 px-3 py-1.5 text-xs font-bold tracking-widest text-sky-400 transition hover:bg-sky-500/20"
        >
          LAB
        </Link>
        <div className="mx-2 h-4 w-px bg-slate-800" />
        <button
          onClick={handleLogout}
          className="rounded-md px-3 py-1.5 text-xs tracking-widest text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
        >
          SALIR
        </button>
      </div>
    </nav>
  );
}
