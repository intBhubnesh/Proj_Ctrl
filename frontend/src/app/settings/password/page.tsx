"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SetPasswordPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        try {
            setIsLoading(true)

            const response = await fetch('/api/user/set-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password,
                    confirmPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to set password')
                return
            }

            setSuccess(data.message)
            setPassword('')
            setConfirmPassword('')

            // Redirect after 2 seconds
            setTimeout(() => {
                const user = session?.user as any
                if (user?.role === 'STUDENT') {
                    router.push('/student/dashboard')
                } else if (user?.role === 'TEACHER') {
                    router.push('/teacher/dashboard')
                } else {
                    router.push('/admin/dashboard')
                }
            }, 2000)

        } catch (error) {
            console.error('Error setting password:', error)
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Set Password</CardTitle>
                    <CardDescription>
                        Set a password to enable email/password login in addition to Google Sign-In
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                                {success}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                                required
                                minLength={8}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Setting Password...' : 'Set Password'}
                        </Button>

                        <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-xs text-blue-800">
                                💡 After setting a password, you'll be able to login using either:
                            </p>
                            <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                                <li>Email and password</li>
                                <li>Google Sign-In</li>
                            </ul>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

