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
      if (account && account.provider === "google" && user) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          console.log("Calling backend:", backendUrl, "with user:", user);
          
          const response = await axios.post(
            `${backendUrl}/api/auth/google`,
            {
              google_id: user.id,
              email: user.email,
              name: user.name,
              profile_picture: user.image,
            },
            { timeout: 5000 }
          );

          console.log("Backend response:", response.data);
          token.accessToken = response.data.token;
          token.hasSubscription = response.data.user?.has_subscription || false;
          token.userId = response.data.user?.id;
        } catch (error: any) {
          console.error("Backend auth failed:", error.message, error.response?.data);
          throw new Error("Failed to authenticate with backend");
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
        session.hasSubscription = token.hasSubscription;
        session.userId = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
