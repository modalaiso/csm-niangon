import { ModerationTabs } from "@/components/admin/moderation-tabs";
import { requireModerator } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Modération | Dashboard | CSM Niangon",
};

export default async function AdminModerationPage() {
  await requireModerator();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Modération</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mots-clés surveillés, commentaires en attente de revue, et journal des
          actions.
        </p>
      </div>
      <ModerationTabs />
    </div>
  );
}
