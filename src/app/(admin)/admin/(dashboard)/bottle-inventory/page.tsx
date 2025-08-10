import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { BottleInventoryMainSection } from "./bottle-inventory-main-section";

const BottleInventoryPage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center">
      <WelcomeSection
        text="Here you can monitor bottle usage and inventory for your platform."
        greeting="Hey there"
      />

      <BottleInventoryMainSection />
    </div>
  );
};
export default BottleInventoryPage;
