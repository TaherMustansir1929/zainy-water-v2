import { adminMiddleware } from "@/actions/admin/admin-middleware";
import { AppSidebar } from "../../_components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { AdminHeader } from "./admin-header";

type Props = { children: React.ReactNode };

const DashboardLayout = async ({ children }: Props) => {
  const admin = await adminMiddleware();

  if (!admin.success) {
    redirect("/admin/login");
  }

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
