import { getProfileData } from "@/actions/profile";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Dashboard Auth Error:", authError);
    // console.log("User:", user);
    redirect("/login");
  }

  let data;
  try {
    data = await getProfileData();
  } catch (error) {
    console.error("Dashboard Layout Error (Profile Data):", error);
    // If getProfileData throws an error after successful auth, redirect to onboarding or handle appropriately
    redirect("/onboarding");
  }

  if (!data?.profile?.codename) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
