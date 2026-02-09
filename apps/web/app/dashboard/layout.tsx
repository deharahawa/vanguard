import { getProfileData } from "@/actions/profile";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let data;
  try {
    data = await getProfileData();
  } catch (error) {
    console.error("Dashboard Layout Error (Auth):", error);
    // If getProfileData throws Unauthorized or fails, redirect to login
    redirect("/login");
  }

  if (!data?.profile?.codename) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
