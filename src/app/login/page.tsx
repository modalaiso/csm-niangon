import { LoginForm } from "@/components/forms/login-form"
import Link from "next/link"
import { ShieldUser } from "lucide-react"

export default function LoginPage() {
    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-50 p-4">
            <div className="absolute top-4 right-4">
                <Link href="/admin-login" className="flex items-center justify-center bg-primary rounded-full h-10 w-10 border border-primarys2 shadow-lg hover:bg-primary/90 transition-colors">
                    <ShieldUser className="h-5 w-5 text-white" />
                </Link>
            </div>
            <LoginForm />
        </div>
    )
}
