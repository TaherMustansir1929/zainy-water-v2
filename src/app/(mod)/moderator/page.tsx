import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DailyDeliveryForm } from "./daily-delivery-form";
import { DailyDeliveryTable } from "./daily-delivery-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarCheck, LinkIcon } from "lucide-react";
import { moderatorMiddleware } from "@/actions/moderator/mod-middleware";
import { redirect } from "next/navigation";

const ModeratorPage = async () => {
  const moderator = await moderatorMiddleware();

  if (!moderator.success) {
    redirect("/moderator/login");
  }

  return (
    <main className="min-h-screen w-full flex flex-col md:items-center md:justify-center my-4 gap-y-4 p-2">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-primary font-bold text-xl text-center flex items-center justify-center gap-2">
            <CalendarCheck />
            Daily Delivery Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyDeliveryForm />
        </CardContent>
      </Card>

      <DailyDeliveryTable />

      <Button variant={"outline"} className="w-full max-w-2xl" size="lg">
        <Link
          href={"/moderator/other"}
          className="flex items-center justify-center gap-2"
        >
          Add Other Records
          <LinkIcon />
        </Link>
      </Button>
    </main>
  );
};
export default ModeratorPage;
