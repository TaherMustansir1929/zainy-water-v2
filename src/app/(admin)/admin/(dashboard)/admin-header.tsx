"use client";

import { SidebarToggleButton } from "../../_components/sidebar-toggle-button";
import { UserButton } from "@clerk/nextjs";

export const AdminHeader = () => {
  return (
    <header className="w-full border-b border-gray-200 p-2 flex justify-between items-center">
      <div>
        <SidebarToggleButton />
      </div>
      <h1 className="text-lg font-semibold font-mono">Admin Dashboard</h1>
      <div>
        <div className={"flex items-center gap-2"}>
          <UserButton />
        </div>
      </div>
    </header>
  );
};
