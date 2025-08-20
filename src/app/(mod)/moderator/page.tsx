import { moderatorMiddleware } from "@/actions/moderator/mod-middleware";
import { redirect } from "next/navigation";
import { ModTabs } from "./mod-tabs";

const OtherExpensePage = async () => {
  const moderator = await moderatorMiddleware();

  if (!moderator.success) {
    redirect("/moderator/login");
  }

  return (
    <div className="flex flex-col md:items-center justify-start min-h-screen gap-y-10 md:mt-4 md:px-4">
      <ModTabs />
    </div>
  );
};

export default OtherExpensePage;
