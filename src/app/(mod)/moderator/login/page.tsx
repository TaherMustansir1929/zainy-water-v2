import { UserCheck } from "lucide-react";
import { ModLoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import { modLoginStatus } from "@/actions/moderator/mod-login-status.action";

const ModLoginPage = async () => {
  const isLoggedIn = await modLoginStatus();
  console.log(isLoggedIn.message);

  if (isLoggedIn.success) {
    redirect(`/moderator`);
  }

  return (
    <div
      className="flex flex-col md:items-center md:justify-center gap-y-6 p-2 mt-4"
      style={{ minHeight: "calc(100vh - 130px)" }}
    >
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-3">
            <UserCheck />
            Moderator Login Page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ModLoginForm />
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center">
            Sign-in with your assigned moderator username and password. For any
            queries contact the admin.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
export default ModLoginPage;
