import { AboutPageEditor } from "@/components/admin/about-page-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAboutPageContent } from "@/lib/about-page";
import { requireAdmin } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "Page À propos | Dashboard - CSM Niangon",
};

export default async function AdminAboutPage() {
  await requireAdmin();
  const content = await getAboutPageContent();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Page À propos"
        description="Modifiez les textes affichés sur la page publique À propos de nous."
      />
      <AboutPageEditor content={content} />
    </div>
  );
}
