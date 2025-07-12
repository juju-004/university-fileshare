import React from "react";
import MainLayout from "./Main";
import { redirect } from "next/navigation";
import { initAuth } from "@/lib/auth";
import { cookies } from "next/headers";
import { SessionProvider } from "@/context/SessionContext";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lucia = await initAuth();
  const cookie = (await cookies()).get("session")?.value ?? "";
  const { user } = await lucia.validateSession(cookie ?? "");

  if (!user) redirect("/signin");

  return (
    <SessionProvider initialUser={user}>
      <MainLayout>{children}</MainLayout>
    </SessionProvider>
  );
}
