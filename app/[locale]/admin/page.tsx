import { createClient } from "@/lib/supabase/server";
import AdminClient from "@/app/admin/AdminClient";
import AdminLogin from "@/app/admin/AdminLogin";
import { getAllArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <AdminLogin />;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return <AdminLogin />;
  }

  const articles = await getAllArticles();
  return <AdminClient articles={articles} />;
}
