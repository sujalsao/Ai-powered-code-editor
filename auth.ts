import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { db } from "./src/lib/db";
import { getAccountByUserId, getUserById } from "./modules/auth/actions";
 
export const {handlers, signIn, signOut, auth } = NextAuth({
callbacks: {
  async signIn({ user, account }) {
    if (!user || !account) return false;

    const existingUser = await db.user.findUnique({
      where: { email: user.email! },
    });

    if (!existingUser) {
      const newUser = await db.user.create({
        data: {
          email: user.email!,
          name: user.name,
          image: user.image,
          accounts: {
            // @ts-ignore
            create: {
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state as string | null,
            },
          },
        },
      });

      if (!newUser) return false;
    } else {
      const existingAccount = await db.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      });

      if (!existingAccount) {
        await db.account.create({
          data: {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state as string | null,
          },
        });
      }
    }

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