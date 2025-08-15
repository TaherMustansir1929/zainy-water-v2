import { LoadingDotsBounce } from "@/components/loading-dots";
import { adminMiddleware } from "@/actions/admin/adminMiddleware";
import { redirect } from "next/navigation";

async function CallbackPage() {
  const response = await adminMiddleware();
  console.log(response);

  if (response.status === 200 || response.status === 201) {
    redirect("/admin");
  } else if (response.status === 401 || response.status === 500) {
    redirect("/sign-in");
  }

  return (
    <div
      className={
        "min-h-screen w-full flex flex-col gap-2 justify-center items-center"
      }
    >
      Attempting to login...
      <LoadingDotsBounce />
    </div>
  );
}

export default CallbackPage;
