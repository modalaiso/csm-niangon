import { ModerationTabs } from "@/components/admin/moderation-tabs";

export const metadata = {
  title: "Modération | Dashboard admin",
};

export default function AdminModerationPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Modération</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mots-clés surveillés, commentaires en attente de revue, et journal des actions.
        </p>
      </div>
      <ModerationTabs />
    </div>
  );
}