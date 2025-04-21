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
    async jwt({token,user}) {
      return {...token,...user}
  },
  async session({session,token,user}) {
      session.user = token
      return session
  },
    async signIn({ user }) {
      if (user) {
        // Redirect to home after successful sign-in
        return true;
      }
      return false; // In case the user is not valid
    },
    async redirect({ url, baseUrl }) {
      // After sign-in or sign-out, redirect to the home page
      return baseUrl + "/home"; // Customize this redirect if necessary
    },
  },
  pages: {
    signIn: "/signin",
  },
};
