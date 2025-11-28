"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface TeamMember {
    id: string
    userId: string
    name: string
    email: string
    role: string
    isLeader: boolean
}

export default function ProjectSubmissionPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
    const [projectData, setProjectData] = useState({
        technology: "",
        domain: "",
        problemStatement: "",
        srsReport: null as File | null,
        pptLink: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [validationError, setValidationError] = useState("")
    const router = useRouter()

    // Fetch team members on mount
    useEffect(() => {
        fetchTeamMembers()
    }, [])

    const fetchTeamMembers = async () => {
        try {
            const response = await fetch('/api/teams/current')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch team')
            }

            if (!data.hasTeam) {
                router.push('/student/team-setup')
                return
            }

            // Map team members to component format
            const members: TeamMember[] = data.team.members.map((m: any) => ({
                id: m.id,
                userId: m.userId,
                name: m.name,
                email: m.email,
                role: m.declaredRole || "",
                isLeader: m.role === 'LEADER'
            }))

            setTeamMembers(members)
        } catch (err: any) {
            setError(err.message || 'Failed to load team members')
        }
    }

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
        setError("")
        setValidationError("")

        // Validate all fields
        const allRolesFilled = teamMembers.every(member => member.role)
        const allFieldsFilled = projectData.technology && projectData.domain &&
            projectData.problemStatement && projectData.srsReport

        if (!allRolesFilled) {
            setValidationError("Please assign roles to all team members")
            return
        }

        if (!allFieldsFilled) {
            setValidationError("Please fill all required fields")
            return
        }

        setIsLoading(true)

        try {
            // First, validate team members (check no one is in other teams)
            const validateResponse = await fetch('/api/teams/validate', {
                method: 'POST'
            })

            const validateData = await validateResponse.json()

            if (!validateResponse.ok || !validateData.canProceed) {
                throw new Error(validateData.message || 'Team validation failed')
            }

            // Prepare form data
            const formData = new FormData()
            formData.append('technology', projectData.technology)
            formData.append('domain', projectData.domain)
            formData.append('problemStatement', projectData.problemStatement)
            formData.append('srsFile', projectData.srsReport!)
            formData.append('pptUrl', projectData.pptLink || '')
            formData.append('teamMembers', JSON.stringify(
                teamMembers.map(m => ({ userId: m.userId, role: m.role }))
            ))

            // Submit project
            const response = await fetch('/api/projects/submit', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                // Check if it's a plagiarism error
                if (data.plagiarismDetected) {
                    setError(
                        `Plagiarism Detected!\n\n` +
                        `Your SRS has ${data.scorePercentage}% similarity with existing submissions.\n\n` +
                        `Matched files:\n${data.matchedFiles.join('\n')}\n\n` +
                        `Please revise your SRS to make it more unique.`
                    )
                } else {
                    throw new Error(data.error || 'Submission failed')
                }
                return
            }

            // Success - redirect to dashboard
            alert('Project submitted successfully! No plagiarism detected.')
            router.push('/student/dashboard')

        } catch (err: any) {
            setError(err.message || 'Failed to submit project')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Project Submission</h1>
                    <p className="text-muted-foreground">Complete your project details and team information</p>
                </div>

                {/* Error Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-semibold text-red-900 mb-2">Submission Error</h3>
                        <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                    </div>
                )}

                {validationError && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">{validationError}</p>
                    </div>
                )}

                {teamMembers.length === 0 && !error && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">Loading team members...</p>
                    </div>
                )}

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
