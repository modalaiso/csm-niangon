import { redirect } from "next/navigation";
import { getMyNotifications } from "@/app/actions/notifications";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";

export const metadata = {
  title: "Notifications | CSM Niangon",
};

export default async function NotificationsPage() {
  const result = await getMyNotifications(50);

  if ("error" in result) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nouvelles publications, réponses et réactions à votre activité.
        </p>
        <div className="mt-6">
          <NotificationsPageClient
            initialNotifications={result.notifications}
          />
        </div>
      </div>
    </main>
  );
}
