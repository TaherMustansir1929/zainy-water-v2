import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtherExpenseForm } from "./other-expense-form";
import { OtherExpenseTable } from "./other-expense-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChartPie, CircleDollarSign, LinkIcon } from "lucide-react";
import { moderatorMiddleware } from "@/actions/moderator/mod-middleware";
import { redirect } from "next/navigation";
import { BottleUsageForm } from "./bottle-usage-form";
import { ModTabs } from "./mod-tabs";

const OtherExpensePage = async () => {
  const moderator = await moderatorMiddleware();

  if (!moderator.success) {
    redirect("/moderator/login");
  }

  return (
    <div className="flex flex-col md:items-center justify-start min-h-screen gap-y-10 md:mt-4 md:px-4">
      <ModTabs />
      {/* 
      

       */}
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
