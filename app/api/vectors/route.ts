import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { phrase } = await req.json();

    if (!phrase || typeof phrase !== "string" || phrase.trim().length === 0) {
      return NextResponse.json({ error: "Frase inválida o vacía" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("session")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent(phrase.trim());

    const geminiVector: number[] = result.embedding.values;

    if (!geminiVector || geminiVector.length === 0) {
      return NextResponse.json({ error: "Gemini no devolvió un vector válido" }, { status: 500 });
    }

    const saved = await prisma.vectorData.create({
      data: {
        phrase: phrase.trim(),
        geminiVector: geminiVector,
        textEmbedVector: [],
      },
    });

    return NextResponse.json({
      id: saved.id,
      geminiVector,
      dimensions: geminiVector.length,
    });

  } catch (error) {
    console.error("[VECTORS ERROR]", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("session")?.value;
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id, textEmbedVector } = await req.json();
    if (!id || !Array.isArray(textEmbedVector)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await prisma.vectorData.update({
      where: { id },
      data: { textEmbedVector },
    });

    return NextResponse.json({ message: "Vector local guardado" });
  } catch (error) {
    console.error("[PATCH VECTORS ERROR]", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}