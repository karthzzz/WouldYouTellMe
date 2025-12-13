import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && account.provider === "google") {
        try {
          // Call backend to authenticate and get JWT token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/google`,
            {
              google_id: user?.id,
              email: user?.email,
              name: user?.name,
              profile_picture: user?.image,
            }
          );

          token.accessToken = response.data.token;
          token.hasSubscription = response.data.user.has_subscription;
          token.userId = response.data.user.id;
        } catch (error) {
          console.error("Backend auth failed:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.hasSubscription = token.hasSubscription;
      session.userId = token.userId;
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
