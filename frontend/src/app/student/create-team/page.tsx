"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CreateTeamPage() {
    const [teamName, setTeamName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            toast.error("Please enter a team name")
            return
        }

        setIsLoading(true)
        setError("")
        console.log('🚀 Creating team:', teamName)

        try {
            const response = await fetch("/api/teams/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: teamName }),
            })

            console.log('📥 Response status:', response.status)
            const data = await response.json()
            console.log('📥 Response data:', data)

            if (!response.ok) {
                console.error('❌ API error:', data.error)
                toast.error("Failed to create team", {
                    description: data.error || "An error occurred while creating the team"
                })
                return
            }

            // Team created successfully
            console.log('✅ Team created successfully:', data.team.code)
            toast.success("Team created successfully!", {
                description: `Team code: ${data.team.code}. Share this code with your team members.`
            })
            // Redirect to team management page
            setTimeout(() => router.push('/student/team'), 1000)
        } catch (err: any) {
            console.error('❌ Error creating team:', err)
            toast.error("Failed to create team", {
                description: err.message || "An unexpected error occurred"
            })
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Create Team</CardTitle>
                    <CardDescription className="text-center">
                        Enter a name for your team and become the team leader
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="teamName">Team Name</Label>
                        <Input
                            id="teamName"
                            type="text"
                            placeholder="Enter your team name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            disabled={isLoading}
                        />
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Team Leader Responsibilities:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Upload project documents and presentations</li>
                            <li>• Manage team member roles</li>
                            <li>• Submit project for plagiarism check</li>
                            <li>• Coordinate with team members</li>
                        </ul>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleCreateTeam}
                        disabled={!teamName.trim() || isLoading}
                    >
                        {isLoading ? "Creating Team..." : "Create Team"}
                    </Button>

                    <div className="text-center">
                        <Button variant="link" onClick={() => router.back()}>
                            Back to Team Setup
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
