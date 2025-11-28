"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import GradientBackground from "@/components/ui/gradient-background"

export default function StudentOnboardingPage() {
    const [formData, setFormData] = useState({
        enrollmentNo: "",
        department: "",
        semester: "",
        division: "",
        institution: "",
        course: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const { update } = useSession()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('🚀 Form submitted')
        setError(null)

        if (!formData.enrollmentNo || !formData.department) {
            setError("Enrollment number and department are required")
            return
        }

        setIsLoading(true)
        console.log('📤 Sending request to API...', formData)

        try {
            const response = await fetch('/api/user/profile/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            console.log('📥 Response status:', response.status)
            const data = await response.json()
            console.log('📥 Response data:', data)

            if (response.ok) {
                console.log('✅ Profile created successfully')
                // Update session
                await update()
                console.log('✅ Session updated, redirecting...')
                // Redirect to team creation/joining page
                router.push('/student/team-setup')
            } else {
                console.error('❌ API error:', data.error)
                setError(data.error || 'Failed to create profile')
            }
        } catch (error) {
            console.error('❌ Error creating profile:', error)
            setError('An error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                            Complete Your Student Profile
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Please provide your academic information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="enrollmentNo">Enrollment Number *</Label>
                                    <Input
                                        id="enrollmentNo"
                                        name="enrollmentNo"
                                        value={formData.enrollmentNo}
                                        onChange={handleChange}
                                        placeholder="e.g., 2024CS001"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="department">Department *</Label>
                                    <Input
                                        id="department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="e.g., Computer Science"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semester">Semester</Label>
                                    <Input
                                        id="semester"
                                        name="semester"
                                        type="number"
                                        min="1"
                                        max="8"
                                        value={formData.semester}
                                        onChange={handleChange}
                                        placeholder="e.g., 5"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="division">Division</Label>
                                    <Input
                                        id="division"
                                        name="division"
                                        value={formData.division}
                                        onChange={handleChange}
                                        placeholder="e.g., A"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Input
                                        id="course"
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        placeholder="e.g., B.Tech"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="institution">Institution</Label>
                                    <Input
                                        id="institution"
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleChange}
                                        placeholder="e.g., XYZ College"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
