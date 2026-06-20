import { AdminSignupForm } from "@/components/forms/admin-signup-form";
import Link from "next/link";
import Image from "next/image";

export default function AdminSignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold text-blue-900 hover:opacity-80">
          {/*Logo*/}
          <div className="mb-4 mt-4 inline-block">
            <Image src="/logo-b.png" alt="Logo" width={100} height={50} />
          </div>
        </Link>
      </div>
      <AdminSignupForm />
    </div>
  );
}
