import { connection } from "next/server";
import { fetchDashboardData } from "@/lib/supabase/queries";
import { DashboardClient } from "./dashboard-client";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const stats = await fetchDashboardData();

  return <DashboardClient stats={stats} />;
}
