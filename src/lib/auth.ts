import NextAuth, { type User as NextAuthUser } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

interface EHUUser extends NextAuthUser {
  role: string
  etablissementId?: string | null
  wilayadId?: string | null
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["medecin", "epidemiologiste", "admin"]),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password, role } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          include: { etablissement: true, wilaya: true },
        })

        if (!user || !user.isActive) return null
        if (user.role !== role) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          etablissementId: user.etablissementId,
          wilayadId: user.wilayadId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as EHUUser).role
        token.etablissementId = (user as EHUUser).etablissementId
        token.wilayadId = (user as EHUUser).wilayadId
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.etablissementId = token.etablissementId as string
        session.user.wilayadId = token.wilayadId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },
})
