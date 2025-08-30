import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";
import { WhatsappCodeMainSection } from "./whatsapp-code-main-section";

const QRCodePage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text={
          "Here you can pair your WhatsApp account with the app for automation."
        }
        greeting="What's up"
      />
      <WhatsappCodeMainSection />
    </div>
  );
};
export default QRCodePage;
