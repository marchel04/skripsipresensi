import { cookies } from "next/headers";
import LoginPageClient from "./LoginPageClient";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt");

  if (token) {
    redirect("/dashboard");
  }

  return (
    <>
      <LoginPageClient />
    </>
  );
};

export default LoginPage;
