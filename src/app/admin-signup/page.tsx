import { AdminSignupForm } from "@/components/forms/admin-signup-form"
import Link from "next/link"

export default function AdminSignupPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
            <div className="mb-8 text-center flex flex-col items-center justify-center">
                {/*<Link href="/" className="text-3xl font-bold text-red-900 hover:opacity-80">
                    CSM Niangon
                </Link>
                <div className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                    SECRET ACCESS
                </div>*/}
            </div>
            <AdminSignupForm />
        </div>
    )
}
