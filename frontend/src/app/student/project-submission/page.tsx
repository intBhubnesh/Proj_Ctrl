"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface TeamMember {
    id: string
    name: string
    email: string
    role: string
    isLeader: boolean
}

export default function ProjectSubmissionPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { id: "1", name: "John Doe", email: "john@example.com", role: "", isLeader: true }
    ])
    const [projectData, setProjectData] = useState({
        technology: "",
        domain: "",
        problemStatement: "",
        srsReport: null as File | null,
        pptLink: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const roles = ["Frontend Developer", "Backend Developer", "UI/UX Designer", "Project Manager", "Database Administrator", "DevOps Engineer"]

    const handleRoleChange = (memberId: string, role: string) => {
        setTeamMembers(prev =>
            prev.map(member =>
                member.id === memberId ? { ...member, role } : member
            )
        )
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProjectData(prev => ({ ...prev, srsReport: file }))
        }
    }

    const handleSubmit = async () => {
        // Validate all fields
        const allRolesFilled = teamMembers.every(member => member.role)
        const allFieldsFilled = projectData.technology && projectData.domain &&
            projectData.problemStatement && projectData.srsReport &&
            projectData.pptLink

        if (!allRolesFilled || !allFieldsFilled) {
            alert("Please fill all fields and assign roles to all members")
            return
        }

        setIsLoading(true)

        // TODO: Implement project submission
        console.log("Submitting project:", { projectData, teamMembers })

        setTimeout(() => {
            setIsLoading(false)
            router.push("/student/wait")
        }, 3000)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Project Submission</h1>
                    <p className="text-muted-foreground">Complete your project details and team information</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                                <CardDescription>Enter your project information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="technology">Technology</Label>
                                        <Input
                                            id="technology"
                                            placeholder="e.g., React, Node.js, Python"
                                            value={projectData.technology}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, technology: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="domain">Domain</Label>
                                        <Input
                                            id="domain"
                                            placeholder="e.g., Web Development, AI/ML"
                                            value={projectData.domain}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, domain: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="problemStatement">Problem Statement</Label>
                                    <textarea
                                        id="problemStatement"
                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Describe the problem your project solves..."
                                        value={projectData.problemStatement}
                                        onChange={(e) => setProjectData(prev => ({ ...prev, problemStatement: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="srsReport">SRS Report (PDF)</Label>
                                    <Input
                                        id="srsReport"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pptLink">Presentation Link</Label>
                                    <Input
                                        id="pptLink"
                                        placeholder="https://docs.google.com/presentation/..."
                                        value={projectData.pptLink}
                                        onChange={(e) => setProjectData(prev => ({ ...prev, pptLink: e.target.value }))}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Team Members Panel */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>Assign roles to all team members</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{member.name}</p>
                                                {member.isLeader && (
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        Leader
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                            <div className="space-y-1">
                                                <Label>Role</Label>
                                                <select
                                                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                >
                                                    <option value="">Select role...</option>
                                                    {roles.map((role) => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="text-center text-sm text-muted-foreground">
                                    {teamMembers.length}/4 members
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            className="w-full"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit Project"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
