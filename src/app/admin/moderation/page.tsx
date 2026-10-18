import { ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ModerationTabs } from "@/components/admin/moderation-tabs";
import { requireModerator } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Modération | Dashboard - CSM Niangon",
};

export default async function AdminModerationPage() {
  await requireModerator();

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        title="Modération"
        description="Traitez les commentaires signalés, gérez les règles automatiques et consultez l’historique des décisions."
        icon={ShieldAlert}
      />
      <ModerationTabs />
    </div>
  );
}
