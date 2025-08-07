import { MainFooter } from "@/components/main-footer";
import { ModHeader } from "./mod-header";

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
