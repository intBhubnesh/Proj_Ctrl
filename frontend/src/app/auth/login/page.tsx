"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import GradientBackground from "@/components/ui/gradient-background"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginPageContent() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Check if user is already logged in
        const checkSession = async () => {
            const session = await getSession()
            if (session) {
                const user = session.user as any

                // If user hasn't selected a role, redirect to role selection
                if (!user.role) {
                    router.push('/onboarding/role-selection')
                    return
                }

                // If user hasn't completed onboarding, redirect to onboarding
                if (!user.hasCompletedOnboarding) {
                    if (user.role === 'STUDENT') {
                        router.push('/onboarding/student')
                    } else if (user.role === 'TEACHER') {
                        router.push('/onboarding/teacher')
                    } else {
                        router.push('/admin/dashboard')
                    }
                    return
                }

                // Redirect to appropriate dashboard based on role and status
                if (user.role === 'STUDENT') {
                    // Student redirect logic:
                    // 1. No team -> team-setup page
                    // 2. Has team but not verified -> team page (to complete verification)
                    // 3. Team verified -> dashboard
                    if (!user.teamId) {
                        router.push('/student/team-setup')
                    } else if (!user.isTeamVerified) {
                        router.push('/student/team')
                    } else {
                        router.push('/student/dashboard')
                    }
                } else if (user.role === 'TEACHER') {
                    router.push('/teacher/dashboard')
                } else if (user.role === 'ADMIN') {
                    router.push('/admin/dashboard')
                }
            }
        }
        checkSession()
    }, [router])

    useEffect(() => {
        // Check for authentication errors
        const error = searchParams.get('error')
        if (error) {
            setError('Authentication failed. Please try again.')
        }
    }, [searchParams])

    const redirectUser = async () => {
        const session = await getSession()
        const user = session?.user as any

        if (!user?.role) {
            router.push('/onboarding/role-selection')
        } else if (!user?.hasCompletedOnboarding) {
            if (user.role === 'STUDENT') {
                router.push('/onboarding/student')
            } else if (user.role === 'TEACHER') {
                router.push('/onboarding/teacher')
            } else {
                router.push('/admin/dashboard')
            }
        } else {
            if (user.role === 'STUDENT') {
                // Student redirect logic:
                // 1. No team -> team-setup page
                // 2. Has team but not verified -> team page (to complete verification)
                // 3. Team verified -> dashboard
                if (!user.teamId) {
                    router.push('/student/team-setup')
                } else if (!user.isTeamVerified) {
                    router.push('/student/team')
                } else {
                    router.push('/student/dashboard')
                }
            } else if (user.role === 'TEACHER') {
                router.push('/teacher/dashboard')
            } else if (user.role === 'ADMIN') {
                router.push('/admin/dashboard')
            }
        }
    }

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
            } else if (result?.ok) {
                await redirectUser()
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)
            setError(null)

            await signIn('google', {
                callbackUrl: '/onboarding/role-selection'
            })
        } catch (error) {
            console.error('Login error:', error)
            setError('An unexpected error occurred. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="absolute top-8 left-8">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                        <span className="text-xl font-bold text-gray-800">BRAINFLOW</span>
                    </div>
                </div>

                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="space-y-1 pb-8">
                        <CardTitle className="text-4xl font-bold text-center text-gray-800 mb-2">
                            SIGN IN
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCredentialsLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@brainflow.com"
                                    className="h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    disabled={isLoading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="h-12 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    disabled={isLoading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Login'}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">OR</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Login with Google
                                </div>
                            )}
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                            <h4 className="font-medium text-blue-900">
                                Welcome to BRAINFLOW
                            </h4>
                            <div className="text-sm text-blue-800 space-y-2">
                                <p className="font-medium">Two ways to sign in:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li><strong>Email/Password:</strong> For admin accounts (e.g., admin@brainflow.com)</li>
                                    <li><strong>Google Sign-In:</strong> For students and teachers using their Google accounts</li>
                                </ul>
                                <p className="text-xs mt-2 text-blue-700">
                                    💡 If you signed up with Google, you must use "Login with Google" button. Email/password won't work for Google accounts.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GradientBackground>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">Loading...</div>
                </div>
            </GradientBackground>
        }>
            <LoginPageContent />
        </Suspense>
    )
}
