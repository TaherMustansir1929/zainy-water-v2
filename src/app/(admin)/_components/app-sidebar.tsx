"use client";
import {
  Calendar,
  Home,
  Inbox,
  Key,
  PlusCircle,
  Search,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Bottle Inventory",
    url: "/admin/bottle-inventory",
    icon: Home,
  },
  {
    title: "Customer History",
    url: "/admin/customer-history",
    icon: Inbox,
  },
  {
    title: "Set Bottle Price",
    url: "/admin/set-bottle-price",
    icon: Calendar,
  },
  {
    title: "Other Expenses",
    url: "/admin/other-expenses",
    icon: Search,
  },
  {
    title: "Moderator Reports",
    url: "/admin/moderator-reports",
    icon: Settings,
  },
];

const admin_features = [
  {
    title: "Add Moderator",
    url: "/admin/add-moderator",
    icon: PlusCircle,
  },
  {
    title: "Change Password",
    url: "/admin/change-password",
    icon: Key,
  },
];

type Props = {
  className?: string;
};

export function AppSidebar({ className }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar className={cn("flex-1", className)}>
      <SidebarContent>
        <SidebarGroup className="space-y-4">
          <SidebarGroupLabel className="flex items-center justify-center space-x-2 my-8">
            {/* <h1 className="text-2xl">Zainy Water</h1> */}
            <Link href={"/admin"}>
              <Image
                src={"/logo.jpg"}
                alt="Zainy Water"
                width={150}
                height={150}
              />
            </Link>
          </SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-gray-100",
                      pathname === item.url && "bg-gray-300 hover:bg-gray-300"
                    )}
                  >
                    <Link href={item.url} className="text-lg">
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Separator />

              {admin_features.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "hover:bg-gray-100",
                      pathname === item.url && "bg-gray-300 hover:bg-gray-300"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
