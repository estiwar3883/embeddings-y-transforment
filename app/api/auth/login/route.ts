import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario en Neon (PostgreSQL via Prisma)
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Respuesta genérica para no revelar si el email existe
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Comparar contraseña plana contra el hash guardado en DB (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Crear cookie de sesión con el userId
    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,                                  // No accesible desde JS del cliente
      secure: process.env.NODE_ENV === "production",   // Solo HTTPS en producción
      sameSite: "lax",
      maxAge: 60 * 60 * 24,                           // 1 día
      path: "/",
    });

    return NextResponse.json({ message: "Login exitoso" });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
