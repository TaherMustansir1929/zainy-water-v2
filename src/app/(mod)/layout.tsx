import { MainFooter } from "@/components/main-footer";
import { ModHeader } from "@/modules/moderator/components/mod-header";
import "@/lib/orpc.server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Moderator - Zainy Water",
  description: "Moderator layout for Zainy Water",
};

type Props = {
  children: React.ReactNode;
};

const ModLayout = ({ children }: Props) => {
  return (
    <div>
      <ModHeader />
      {children}
      <MainFooter />
    </div>
  );
};
export default ModLayout;
