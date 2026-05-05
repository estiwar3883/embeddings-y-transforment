import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("session"); // Borra la cookie de sesión
  
  return NextResponse.json({ message: "Sesión cerrada" });
}