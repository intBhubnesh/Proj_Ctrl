"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import GradientBackground from "@/components/ui/gradient-background"

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export default function RoleSelectionPage() {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { data: session, update } = useSession()

    const roles = [
        {
            value: 'STUDENT' as UserRole,
            title: "Student",
            description: "I'm a student working on a project",
            icon: "🎓",
            color: "from-blue-500 to-cyan-500"
        },
        {
            value: 'TEACHER' as UserRole,
            title: "Teacher/Mentor",
            description: "I'm a teacher mentoring students",
            icon: "👨‍🏫",
            color: "from-purple-500 to-pink-500"
        },
        {
            value: 'ADMIN' as UserRole,
            title: "Administrator",
            description: "I'm an admin managing the system",
            icon: "⚙️",
            color: "from-orange-500 to-red-500"
        }
    ]

    const handleContinue = async () => {
        if (!selectedRole) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/user/role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: selectedRole })
            })

            if (response.ok) {
                // Update session
                await update()

                // Redirect to appropriate onboarding page
                if (selectedRole === 'STUDENT') {
                    router.push('/onboarding/student')
                } else if (selectedRole === 'TEACHER') {
                    router.push('/onboarding/teacher')
                } else {
                    router.push('/admin/dashboard')
                }
            } else {
                alert('Failed to update role. Please try again.')
            }
        } catch (error) {
            console.error('Error updating role:', error)
            alert('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-gray-800">
                            Welcome to BRAINFLOW
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Please select your role to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            {roles.map((role) => (
                                <button
                                    key={role.value}
                                    onClick={() => setSelectedRole(role.value)}
                                    className={`p-6 rounded-lg border-2 transition-all ${selectedRole === role.value
                                            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                >
                                    <div className="text-center space-y-3">
                                        <div className={`text-5xl mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center`}>
                                            {role.icon}
                                        </div>
                                        <h3 className="font-semibold text-lg">{role.title}</h3>
                                        <p className="text-sm text-gray-600">{role.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={handleContinue}
                                disabled={!selectedRole || isLoading}
                                className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    'Continue'
                                )}
                            </Button>
                        </div>

                        {session?.user?.email && (
                            <p className="text-center text-sm text-gray-600 mt-4">
                                Logged in as: <span className="font-medium">{session.user.email}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </GradientBackground>
    )
}
