import { AdminLoginForm } from "@/components/forms/admin-login-form";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      {/*<div className="mb-8 text-center">
                <Link href="/" className="text-3xl font-bold text-white hover:opacity-80">
                    CSM Niangon
                </Link>
            </div>*/}
      <AdminLoginForm />
    </div>
  );
}
