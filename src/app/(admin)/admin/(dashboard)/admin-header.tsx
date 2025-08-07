"use client";

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { SidebarToggleButton } from "../../_components/sidebar-toggle-button";
import { useConfirm } from "@/hooks/use-confirm";
import { useAdminStore } from "@/lib/admin-state";

export const AdminHeader = () => {
  const [LogoutConfirmDialog, logout_confirm] = useConfirm(
    "Are you sure you want to log out?",
    "You will be redirected to the login page."
  );

  const handleLogout = async () => {
    const ok = await logout_confirm();
    if (!ok) return;

    // Clear admin state and cookies
    useAdminStore.getState().setAdmin(null);
    await cookieStore.delete("admin_id");
    redirect("/admin/login");
  };

  return (
    <header className="w-full border-b border-gray-200 p-2 flex justify-between items-center">
      <LogoutConfirmDialog />
      <div>
        <SidebarToggleButton />
      </div>
      <h1 className="text-lg font-semibold font-mono">Admin Dashboard</h1>
      <div>
        <Button variant="outline" size={"sm"} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
