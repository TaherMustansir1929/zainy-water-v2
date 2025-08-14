import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { AddModMainSection } from "./add-mod-main-section";

const AddModeratorPage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text="Here you can manage moderators for your platform. You can add, edit, and
        remove moderators as needed."
      />

      <AddModMainSection />
    </div>
  );
};
export default AddModeratorPage;
