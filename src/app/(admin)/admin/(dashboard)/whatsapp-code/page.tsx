import { WelcomeSection } from "@/app/(admin)/_components/welcome-section";

const QRCodePage = () => {
  return (
    <div className="w-full min-h-screen flex flex-col justify-start items-center">
      <WelcomeSection
        text={
          "Here you can pair your WhatsApp account with the app for automation."
        }
        greeting="What's up"
      />
      Under Development
    </div>
  );
};
export default QRCodePage;
