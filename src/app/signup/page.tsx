import { SignupForm } from "@/components/forms/signup-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-50 p-4">
      <div className="mb-8 text-center">
        <Link href="/" className="text-3xl font-bold text-blue-900 hover:opacity-80">
          {/*Logo*/}
          <div className="mb-4 mt-4 inline-block">
            <Image src="/logo-g.png" alt="Logo" width={100} height={50} />
          </div>
        </Link>
      </div>
      <SignupForm />
    </div>
  );
}
