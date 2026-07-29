import { Metadata } from "next";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

export const metadata: Metadata = { title: "Analitik" };

export default function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
