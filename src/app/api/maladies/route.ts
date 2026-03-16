import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const maladies = await prisma.maladie.findMany({
      where: { isActive: true },
      orderBy: { nom: "asc" },
    })
    return NextResponse.json(maladies)
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
