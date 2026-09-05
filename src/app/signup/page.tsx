import Link from "next/link";
import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center bg-cover bg-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgb(219 234 254 / 50%), rgb(240 253 244 / 50%)), url('/bg.png')",
      }}
    >
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
            <span className="text-[1rem] leading-[1rem] font-bold text-primary hidden sm:block font-heading">
              CSM Niangon
            </span>
          </div>
        </Link>
      </div>
      <SignupForm />
    </div>
  );
}
