"use client";
import {
  Home,
  Inbox,
  PlusCircle,
  Search,
  ShoppingCart,
  Sparkle,
  User,
} from "lucide-react";

import { ShinyButton } from "@/components/magicui/shiny-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Bottle Inventory",
    url: "/admin/bottle-inventory",
    icon: ShoppingCart,
  },
  {
    title: "Deliveries",
    url: "/admin/deliveries",
    icon: Inbox,
  },
  {
    title: "Customer Information",
    url: "/admin/customer-information",
    icon: User,
  },
  {
    title: "Other Expenses",
    url: "/admin/other-expenses",
    icon: Search,
  },
];

const admin_features = [
  {
    title: "Add Moderator",
    url: "/admin/add-moderator",
    icon: PlusCircle,
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

              <div className="w-full mt-2">
                <Link href="/admin/chat-bot">
                  <ShinyButton className="py-1 px-2 w-full">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <Sparkle className="size-4" />
                        <span className="">GEKKO</span>
                      </div>
                      <Badge variant={"outline"} className="text-[10px]">
                        new
                      </Badge>
                    </div>
                  </ShinyButton>
                </Link>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
