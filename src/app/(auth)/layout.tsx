import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import { redirect } from "next/navigation";
import { initAuth } from "@/lib/auth";
import { cookies } from "next/headers";

import React from "react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lucia = await initAuth();
  const cookie = (await cookies()).get("session")?.value ?? "";
  const { user } = await lucia.validateSession(cookie ?? "");

  if (user) redirect("/");

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <h2 className="text-gray-400 text-center dark:text-white/60 text-3xl font-bold">
                  University <span>File</span>
                  <span className="opacity-70">Share</span> System
                </h2>
                <p className=" text-gray-400 mt-3 dark:text-white/60">
                  By Obolobo bolobo
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
