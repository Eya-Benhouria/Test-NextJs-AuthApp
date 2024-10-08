import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from 'bcryptjs';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "hello@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        const user = await prisma.user.findUnique({
          where: { email: email },
        });

        if (!user) {
          return null; // Return null if user not found
        }

        const hashedPassword = user.password;
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            prenom: user.prenom,
            dateDeNaissance: user.dateDeNaissance,
            adresse: user.adresse,
            numeroDeTelephone: user.numeroDeTelephone,
          };
        } else {
          return null; // Return null if password does not match
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.prenom = user.prenom;
          token.dateDeNaissance = user.dateDeNaissance;
          token.adresse = user.adresse;
          token.numeroDeTelephone = user.numeroDeTelephone;
          // Add an accessToken if you have one
          token.accessToken = user.accessToken || null; // Ensure you set this correctly in the authorize method if needed
        }
        return token;
      },
      async session({ session, token }) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.prenom = token.prenom;
        session.user.dateDeNaissance = new Date(token.dateDeNaissance).toISOString().split('T')[0];
        session.user.adresse = token.adresse;
        session.user.numeroDeTelephone = token.numeroDeTelephone;
        session.accessToken = token.accessToken; // Make sure to include this in the session
        return session;
      },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
