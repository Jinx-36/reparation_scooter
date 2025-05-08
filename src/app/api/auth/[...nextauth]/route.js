import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('Nouveau hash:', hashedPassword);
        const user = await prisma.utilisateur.findUnique({
          where: { email: credentials.email }
        });
      
        if (!user) return null;
      
        // Ajoutez ce log pour débogage
        //console.log('Mot de passe stocké:', user.mot_de_passe);
        //console.log('Mot de passe fourni:', credentials.password);
        
        const passwordValid = await bcrypt.compare(credentials.password, user.mot_de_passe);
        
        if (!passwordValid) {
          console.log('Échec de la comparaison des mots de passe');
          return null;
        }
      
        return { id: user.id, email: user.email, role: user.role };
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    }
  }
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };