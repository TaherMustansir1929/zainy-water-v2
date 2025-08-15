import { AppSidebar } from "../../_components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminHeader } from "./admin-header";

type Props = { children: React.ReactNode };

const DashboardLayout = async ({ children }: Props) => {
  return (
    <SidebarProvider>
      <main className="w-full min-h-screen flex justify-between">
        <AppSidebar />
        <div className="w-full flex-1 flex flex-col gap-2">
          <AdminHeader />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};
export default DashboardLayout;
