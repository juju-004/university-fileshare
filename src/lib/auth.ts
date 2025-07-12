import { Lucia } from "lucia";
import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { getCollections } from "./connect";

export const initAuth = async () => {
  const { users, sessions } = await getCollections();

  const adapter = new MongodbAdapter(sessions, users); // ✅ Correct order

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      name: "session",
      expires: false,
      attributes: {
        secure: process.env.NODE_ENV === "production",
      },
    },
    getUserAttributes: (user) => {
      return {
        username: user.name,
        shortcode: user.shortcode,
      };
    },
  });

  return lucia;
};

// Add Lucia type declaration
declare module "lucia" {
  interface Register {
    Lucia: Awaited<ReturnType<typeof initAuth>>;
    DatabaseUserAttributes: {
      name: string;
      shortcode: string;
    };
  }
}
