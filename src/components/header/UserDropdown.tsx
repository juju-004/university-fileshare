"use client";
import React, { useState, useTransition } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { filterError } from "@/lib/helpers";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { ChevronDown, LogOut } from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const session = useSession();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  const signOut = () => {
    startTransition(async () => {
      try {
        await axios.post("/api/auth/signout");
        toast.success("Signout successful");
        router.replace("/signin");
      } catch (error) {
        toast.error(filterError(error));
      }
      return;
    });
  };

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex gap-2 items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-1 badger flex rounded-full h-8 w-8">
          {session?.shortcode[0]}
        </span>
        <span className="block font-bold text-theme-sm">
          {session?.shortcode}
        </span>

        <ChevronDown
          size={20}
          className={`duration-150 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {session?.shortcode}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {session?.username}
          </span>
        </div>
        <button
          onClick={signOut}
          disabled={isPending}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <LogOut />
          {isPending ? "Signing out..." : "Sign out"}
        </button>
      </Dropdown>
    </div>
  );
}
