import { UserStar } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminLoginForm } from "./admin-login-form";
import { AdminLoginHeader } from "./admin-login-header";
import { adminLoginStatus } from "@/actions/admin/admin-login-status";
import { redirect } from "next/navigation";

const AdminLogin = async () => {
  const isLoggedIn = await adminLoginStatus();
  console.log(isLoggedIn.message);

  if (isLoggedIn.success) {
    redirect("/admin");
  }

  return (
    <main>
      <AdminLoginHeader />
      <div className="flex flex-col md:items-center md:justify-center min-h-[80vh] gap-y-6 p-2 mt-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-3">
              <UserStar />
              Admin Login Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center">
              Sign-in with your assigned admin username and password. Contact
              the software support team for any issues.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};
export default AdminLogin;
