import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import InstagramProvider from "next-auth/providers/instagram"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "local-dev-secret",
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@test.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user && credentials.email === "test@test.com" && credentials.password === "123") {
          user = await prisma.user.create({
            data: {
              email: "test@test.com",
              name: "Test User",
              password: "123"
            }
          })
          return { id: user.id.toString(), name: user.name || "Test User", email: user.email }
        }

        if (user && user.password === credentials.password) {
          return { id: user.id.toString(), name: user.name || "Unknown", email: user.email }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as any).id = token.sub
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
