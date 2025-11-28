"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import GradientBackground from "@/components/ui/gradient-background"

function AuthErrorContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const errorType = searchParams.get('error')
        switch (errorType) {
            case 'Configuration':
                setError('There is a problem with the server configuration.')
                break
            case 'AccessDenied':
                setError('Access denied. You do not have permission to sign in.')
                break
            case 'Verification':
                setError('The verification token has expired or has already been used.')
                break
            default:
                setError('An error occurred during authentication.')
        }
    }, [searchParams])

    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <CardTitle className="text-red-900">Authentication Error</CardTitle>
                        <CardDescription>
                            There was a problem signing you in
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>

                        <div className="space-y-2">
                            <Button
                                className="w-full"
                                onClick={() => router.push('/auth/login')}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/')}
                            >
                                Back to Home
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            If the problem persists, please contact support.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GradientBackground>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">Loading...</div>
                </div>
            </GradientBackground>
        }>
            <AuthErrorContent />
        </Suspense>
    )
}
