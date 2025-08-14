"use client";

import { handleModeratorLogout } from "@/actions/moderator/mod-handle-logout.action";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useModeratorStore } from "@/lib/moderator-state";
import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";

export const ModHeader = () => {
  const pathname = usePathname();

  const [LogoutConfirmDialog, logout_confirm] = useConfirm(
    "Are you sure you want to log out?",
    "You will be redirected to the login page."
  );

  const handleLogout = async () => {
    const ok = await logout_confirm();
    if (!ok) return;

    // Clear moderator state and cookies
    useModeratorStore.getState().setModerator(null);
    await handleModeratorLogout();
    redirect("/moderator/login");
  };

  return (
    <header className="w-full border-b border-gray-200 p-2 flex justify-between items-center">
      <LogoutConfirmDialog />
      <Link href={"/moderator"} className="text-lg font-semibold">
        <Image src={"/logo.jpg"} alt="Zainy Water" width={120} height={120} />
      </Link>
      {!(pathname === "/moderator/login") && (
        <Button variant="outline" size={"sm"} onClick={handleLogout}>
          Logout
        </Button>
      )}
    </header>
  );
};
