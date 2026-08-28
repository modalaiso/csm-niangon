import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/profile";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = {
  title: "Mon profil | CSM Niangon",
};

export default async function ProfilePage() {
  const result = await getMyProfile();

  if ("error" in result) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl px-4 py-8 sm:py-12">
        <h1 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
          Mon profil
        </h1>

        <div className="mt-8 flex justify-center">
          <AvatarUpload
            avatar={result.avatar}
            nom={result.nom}
            prenom={result.prenom}
            username={result.username}
          />
        </div>

        <div className="mt-8">
          <ProfileForm profile={result} />
        </div>
      </div>
    </main>
  );
}
