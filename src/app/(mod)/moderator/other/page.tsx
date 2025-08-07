import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtherExpenseForm } from "./other-expense-form";
import { OtherExpenseTable } from "./other-expense-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircleDollarSign, LinkIcon } from "lucide-react";
import { moderatorMiddleware } from "@/actions/moderator/mod-middleware";
import { redirect } from "next/navigation";
import { toast } from "sonner";

const OtherExpensePage = async () => {
  const moderator = await moderatorMiddleware();

  if (!moderator.success) {
    redirect("/moderator/login");
  }

  return (
    <div className="flex flex-col md:items-center md:justify-center min-h-screen gap-y-6 p-2 mt-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-primary font-bold text-center flex items-center justify-center gap-2">
            <CircleDollarSign />
            Other Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OtherExpenseForm />
        </CardContent>
      </Card>

      <OtherExpenseTable />

      <Button variant={"outline"} className="w-full max-w-2xl" size="lg">
        <Link
          href={"/moderator"}
          className="flex items-center justify-center gap-2"
        >
          Add Daily Delivery
          <LinkIcon />
        </Link>
      </Button>
    </div>
  );
};

export default OtherExpensePage;
