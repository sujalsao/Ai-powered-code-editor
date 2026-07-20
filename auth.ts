import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { db } from "./src/lib/db";
import { getUserById } from "./modules/auth/actions";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;
      (token as any).role = existingUser.role;

      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        (session.user as any).id = token.sub;
      }

      if (session.user) {
        (session.user as any).role = (token as any).role;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})