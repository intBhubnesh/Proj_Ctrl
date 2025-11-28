"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import GradientBackground from "@/components/ui/gradient-background"

export default function TeacherOnboardingPage() {
    const [formData, setFormData] = useState({
        expertise: "",
        technologies: "",
        department: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { update } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        setIsLoading(true)
        try {
            const response = await fetch('/api/user/profile/teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                // Update session
                await update()
                // Redirect to teacher dashboard
                router.push('/teacher/dashboard')
            } else {
                setError(data.error || 'Failed to create profile')
            }
        } catch (error) {
            console.error('Error creating profile:', error)
            setError('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm shadow-xl border-0">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold text-gray-800">
                            Complete Your Teacher Profile
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Help us understand your expertise and interests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g., Computer Science"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expertise">Areas of Expertise</Label>
                                <Textarea
                                    id="expertise"
                                    name="expertise"
                                    value={formData.expertise}
                                    onChange={handleChange}
                                    placeholder="e.g., Web Development, Machine Learning, Data Science"
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-sm text-gray-500">
                                    Separate multiple areas with commas
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="technologies">Technologies & Tools</Label>
                                <Textarea
                                    id="technologies"
                                    name="technologies"
                                    value={formData.technologies}
                                    onChange={handleChange}
                                    placeholder="e.g., React, Python, TensorFlow, Node.js"
                                    rows={4}
                                    className="resize-none"
                                />
                                <p className="text-sm text-gray-500">
                                    Separate multiple technologies with commas
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isLoading ? 'Creating Profile...' : 'Complete Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </GradientBackground>
    )
}

