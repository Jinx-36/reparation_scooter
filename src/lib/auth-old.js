import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Assure-toi d'avoir installé bcryptjs si tu l'utilises et que c'est bien ce que tu utilises pour verifyPassword

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email }
        });

        // Remplacer verifyPassword par ta logique de vérification réelle (j'ai supposé bcrypt.compareSync)
        if (user && bcrypt.compareSync(credentials.password, user.mot_de_passe)) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.prenom} ${user.nom}`,
            role: user.role
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id; // Ajoute l'id au token
      }
      return token;
    },
    async session({ session, token }) {
      console.log('=== TOKEN DANS SESSION CALLBACK ===', token);
      if (session?.user) {
        session.user.role = token?.role;
        session.user.id = token?.id; // Ajoute l'id à la session
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 jours
  },
  jwt: {
    encode: async ({ token, secret }) => {
      return jwt.sign(token, secret);
    },
    decode: async ({ token, secret }) => {
      return jwt.verify(token, secret);
    }
  }
});