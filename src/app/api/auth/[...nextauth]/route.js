import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.mot_de_passe
        );
        
        if (!passwordValid) return null;
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.prenom} ${user.nom}`,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id; // Ajoute l'id au token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token?.id;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/client`;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };