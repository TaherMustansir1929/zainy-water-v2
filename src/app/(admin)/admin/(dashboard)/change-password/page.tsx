import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { AdminChangePasswordForm } from "./change-pass-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AdminChangePassword = () => {
  return (
    <div className="w-full flex flex-col items-center justify-start">
      <WelcomeSection
        greeting="Hello"
        text="Change your current admin password. You will be logged out of all the devices after this change."
      />
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Change Admin Password</CardTitle>
          <CardDescription>
            You will be logged out after changing your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
};
export default AdminChangePassword;
