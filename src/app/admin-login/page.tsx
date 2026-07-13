import { AdminLoginForm } from "@/components/forms/admin-login-form";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold text-blue-900 hover:opacity-80">
          {/*Logo*/}
          <div className="mb-4 mt-4 flex flex-col items-center gap-2 justify-center">
            <Image src="/logo.png" alt="Logo" width={75} height={50} loading="eager"/>
            <span className="text-[1rem] leading-[1rem] font-bold text-primary hidden sm:block">CSM Niangon</span>
          </div>
        </Link>
      </div>
      <AdminLoginForm />
    </div>
  );
}
