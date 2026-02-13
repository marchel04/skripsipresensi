import { cookies } from "next/headers";
import "../globals.css";
import MainLayoutClient from "./_view/LayoutClient";
import { redirect } from "next/navigation";

const MainLayout = async ({ children }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt");

  if (!token) {
    redirect("/login");
  }

  return <MainLayoutClient>{children}</MainLayoutClient>;
};

export default MainLayout;
