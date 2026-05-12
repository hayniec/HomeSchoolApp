import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

// Ensure NEXTAUTH_URL is set so signIn/signOut redirects and cookies match the
// deployed origin. Netlify exposes URL (production) and DEPLOY_PRIME_URL (deploy
// previews); Vercel exposes VERCEL_URL without a scheme.
if (!process.env.NEXTAUTH_URL) {
  const inferred =
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (inferred) process.env.NEXTAUTH_URL = inferred;
}
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data: user, error } = await supabase
            .from("User")
            .select("*")
            .eq("email", credentials.email)
            .single();

          if (error || !user || !user.password) return null;

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) return null;

          return user;
        } catch (error) {
          console.error("NextAuth Authorize Error:", error);
          throw new Error("Failed to authenticate to the database. Check Netlify function logs.");
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "my-super-secret-key-12345!@#",
});

export { handler as GET, handler as POST };
