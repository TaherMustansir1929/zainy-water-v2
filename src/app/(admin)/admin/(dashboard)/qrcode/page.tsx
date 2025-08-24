import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { QRCodeMainSection } from "./qrcode-main-section";

const QRCodePage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text={"Here you can scan the qrcode for whatsapp automation."}
        greeting="What's up"
      />
      <QRCodeMainSection />
    </div>
  );
};
export default QRCodePage;
