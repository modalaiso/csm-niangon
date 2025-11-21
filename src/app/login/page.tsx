import { LoginForm } from "@/components/forms/login-form"
import Link from "next/link"

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-50 p-4">
            {/*<div className="mb-8 text-center">
                <Link href="/" className="text-3xl font-bold text-blue-900 hover:opacity-80">
                    CSM Niangon
                </Link>
            </div>*/}
            <LoginForm />
        </div>
    )
}
