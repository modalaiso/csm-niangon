import { SignupForm } from "@/components/forms/signup-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-50 p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center justify-center bg-primary rounded-full h-10 w-10 border border-primarys2 shadow-lg hover:bg-primary/90 transition-colors">
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
      </div>
      {/*<div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-bold text-blue-900 hover:opacity-80">
            CSM Niangon
          </Link>
        </div>*/}
      <SignupForm />
    </div>
  );
}
