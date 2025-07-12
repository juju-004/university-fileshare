"use client";

import { createContext, useContext, useState, useEffect } from "react";

type SessionUser = {
  id: string;
  username: string;
  shortcode: string;
} | null;

const SessionContext = createContext<SessionUser>(null);

export const useSession = () => useContext(SessionContext);

export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: SessionUser;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SessionUser>(initialUser);

  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}
