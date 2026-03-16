import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Admin requis" }, { status: 403 })

  const { id } = await params
  const body = await req.json() as { isActive?: boolean; role?: string; firstName?: string; lastName?: string; password?: string }

  const data: Record<string, unknown> = {}
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.role) data.role = body.role
  if (body.firstName) data.firstName = body.firstName
  if (body.lastName) data.lastName = body.lastName
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 12)

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { etablissement: { select: { nom: true } } },
  })
  return NextResponse.json(user)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Admin requis" }, { status: 403 })

  const { id } = await params
  await prisma.user.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
