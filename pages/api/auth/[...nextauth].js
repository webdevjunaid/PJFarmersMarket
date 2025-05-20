import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@next-auth/supabase-adapter";
import supabaseAdmin from "@/utils/supabaseAdmin";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.userType
        ) {
          return null;
        }

        const table = credentials.userType === "vendor" ? "vendor" : "customer";
        const { data: user, error } = await supabaseAdmin
          .from(table)
          .select(
            table === "vendor"
              ? "id, email, password, name"
              : "id, email, password, first_name"
          )
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          console.error("Supabase error during sign-in:", error?.message);
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: table === "vendor" ? user.name : user.first_name,
          userType: credentials.userType,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 1500,
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.name = token.name;
        session.user.id = token.sub;
        session.user.userType = token.userType;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.userType = user.userType;
      }
      return token;
    },
  },
  pages: {
    signIn: "/signin",
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
