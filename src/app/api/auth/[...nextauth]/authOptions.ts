// authOptions.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import userLogin from "@/libs/userLogin"; // This is the function that handles login logic

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Call your login function to validate the credentials
        const user = await userLogin(credentials.email, credentials.password);

        if (user) {
          return user;
        } else {
          return null; // If invalid credentials, return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name || user.email;
        token.email = user.email;
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = {
        name: token.name,
        email: token.email,
      };
      return session;
    },
  },
};
