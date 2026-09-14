import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        const email = credentials.email.toLowerCase();

        // Serverless Vercel demo fallback for clinic accounts
        if (email.includes('admin')) {
          return {
            id: 'u-admin-1',
            name: 'Dr. Iswariya',
            email: 'admin@lakshmidental.com',
            role: 'SUPER_ADMIN',
          };
        } else if (email.includes('ramana')) {
          return {
            id: 'u-dentist-1',
            name: 'Dr. Ramana Krishnamurthy',
            email: 'ramana@lakshmidental.com',
            role: 'DENTIST',
          };
        } else if (email.includes('reception')) {
          return {
            id: 'u-rec-1',
            name: 'Ananya Sundaram',
            email: 'reception@lakshmidental.com',
            role: 'RECEPTIONIST',
          };
        }

        return {
          id: 'u-default-1',
          name: 'Dr. Iswariya',
          email: credentials.email,
          role: 'SUPER_ADMIN',
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.name = user.name || 'Dr. Iswariya';
      }
      if (!token.role || token.role === 'SUPER_ADMIN' || token.email?.includes('admin')) {
        token.name = 'Dr. Iswariya';
        token.role = 'SUPER_ADMIN';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || 'SUPER_ADMIN';
        if (!session.user.name || session.user.name === 'Super Admin' || session.user.email?.includes('admin') || token.role === 'SUPER_ADMIN') {
          session.user.name = 'Dr. Iswariya';
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'lakshmi-dental-care-secret-key-2026',
};
