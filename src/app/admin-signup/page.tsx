import Link from "next/link";
import { AdminSignupForm } from "@/components/forms/admin-signup-form";

export default function AdminSignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-bold text-blue-900 hover:opacity-80"
        >
          {/*Logo*/}
          <div className="mb-4 mt-4 flex flex-col items-center gap-2 justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              width={75}
              height={50}
              loading="eager"
            />
            <span className="text-[1rem] leading-[1rem] font-bold text-primary hidden sm:block">
              CSM Niangon
            </span>
          </div>
        </Link>
      </div>
      <AdminSignupForm />
    </div>
  );
}
