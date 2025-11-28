"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import GradientBackground from "@/components/ui/gradient-background"

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export default function UnauthorizedPage() {
    const router = useRouter()
    const { data: session } = useSession()

    const handleGoToDashboard = () => {
        if (!session?.user) {
            router.push('/auth/login')
            return
        }

        const role = (session.user as any).role as UserRole

        if (role === 'STUDENT') {
            router.push('/student/dashboard')
        } else if (role === 'TEACHER') {
            router.push('/teacher/dashboard')
        } else if (role === 'ADMIN') {
            router.push('/admin/dashboard')
        } else {
            router.push('/')
        }
    }

    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">🚫</span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Access Denied
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            You don't have permission to access this page
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-gray-600">
                            This page is restricted to specific user roles. Please contact your administrator if you believe this is an error.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleGoToDashboard}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                Go to Dashboard
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                variant="outline"
                                className="w-full"
                            >
                                Go to Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GradientBackground>
    )
}
