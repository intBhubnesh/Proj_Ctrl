"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import GradientBackground from "@/components/ui/gradient-background"
import { Copy, Users, ArrowLeft, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
    id: string
    role: string
    studentProfile: {
        id: string
        userId: string
        user: {
            id: string
            name: string | null
            email: string
        }
    }
}

interface TeamData {
    id: string
    name: string
    code: string
    department: string
    isValidated: boolean
    memberships: TeamMember[]
    project?: {
        repoUrl: string | null
        srsReport: {
            fileName: string
        } | null
    }
}

export default function TeamManagementPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const [team, setTeam] = useState<TeamData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Form state
    const [githubLink, setGithubLink] = useState("")
    const [srsFile, setSrsFile] = useState<File | null>(null)
    const [presentationLink, setPresentationLink] = useState("")

    useEffect(() => {
        fetchTeamData()
    }, [])

    const fetchTeamData = async () => {
        try {
            const response = await fetch("/api/teams/current")
            const data = await response.json()

            if (response.ok && data.team) {
                setTeam(data.team)
                setGithubLink(data.team.project?.repoUrl || "")
                setPresentationLink(data.team.project?.pptUrl || "")
            } else {
                // No team yet, show create/join options
                setTeam(null)
            }
        } catch (err) {
            console.error("Error fetching team:", err)
            setError("Failed to load team data")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopyCode = () => {
        if (team?.code) {
            navigator.clipboard.writeText(team.code)
            toast.success("Team code copied to clipboard!")
        }
    }

    const handleLeaveTeam = async () => {
        if (!confirm("Are you sure you want to leave this team?")) return

        try {
            const response = await fetch("/api/teams/leave", {
                method: "POST",
            })

            if (response.ok) {
                toast.success("Successfully left the team")
                router.push("/student/team-setup")
            } else {
                const data = await response.json()
                toast.error(data.error || "Failed to leave team")
            }
        } catch (err) {
            toast.error("Failed to leave team. Please try again.")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Please upload a PDF file")
                return
            }
            setSrsFile(file)
            toast.success(`Selected file: ${file.name}`)
        }
    }

    const handleSubmitTeam = async () => {
        if (!team) return

        // Validation
        if (team.memberships.length !== 4) {
            toast.error("Team must have exactly 4 members to submit", {
                description: `Current members: ${team.memberships.length}/4. Please invite ${4 - team.memberships.length} more member(s).`
            })
            return
        }

        if (!githubLink || !srsFile) {
            toast.error("Missing required information", {
                description: "Please provide both GitHub link and SRS document"
            })
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Upload SRS file first
            toast.info("Uploading SRS document...")
            const formData = new FormData()
            formData.append("file", srsFile)
            formData.append("teamId", team.id)

            const uploadResponse = await fetch("/api/teams/upload-srs", {
                method: "POST",
                body: formData,
            })

            const uploadData = await uploadResponse.json()

            if (!uploadResponse.ok) {
                // Handle specific error types
                if (uploadData.type === "TEAM_SIZE_ERROR") {
                    toast.error("Team Size Error", {
                        description: uploadData.error,
                        action: {
                            label: "View Details",
                            onClick: () => toast.info(uploadData.action)
                        }
                    })
                } else if (uploadData.type === "DEPARTMENT_MISMATCH") {
                    toast.error("Department Mismatch", {
                        description: uploadData.error,
                        action: {
                            label: "View Details",
                            onClick: () => toast.info(`Departments found: ${uploadData.departments.join(", ")}. ${uploadData.action}`)
                        }
                    })
                } else if (uploadData.type === "INSTITUTION_MISMATCH") {
                    toast.error("Institution Mismatch", {
                        description: uploadData.error,
                        action: {
                            label: "View Details",
                            onClick: () => toast.info(`Institutions found: ${uploadData.institutions.join(", ")}. ${uploadData.action}`)
                        }
                    })
                } else if (uploadData.type === "PLAGIARISM_THRESHOLD_EXCEEDED") {
                    toast.error("Plagiarism Check Failed", {
                        description: uploadData.plagiarismCheck?.message || uploadData.error,
                        duration: 10000,
                        action: {
                            label: "What to do?",
                            onClick: () => toast.info(uploadData.plagiarismCheck?.action || uploadData.action)
                        }
                    })
                } else if (uploadData.type === "PLAGIARISM_SERVICE_ERROR" || uploadData.type === "PLAGIARISM_SERVICE_UNAVAILABLE") {
                    toast.error("System Error", {
                        description: uploadData.message,
                        duration: 10000,
                        action: {
                            label: "What to do?",
                            onClick: () => toast.warning(uploadData.action, { duration: 10000 })
                        }
                    })
                } else {
                    toast.error("Upload Failed", {
                        description: uploadData.error || "Failed to upload SRS file"
                    })
                }
                return
            }

            // Check if team was verified
            if (uploadData.verified) {
                toast.success("Team Verified! 🎉", {
                    description: uploadData.plagiarismCheck?.message || "Your team has been successfully verified!",
                    duration: 5000
                })

                // Refresh session to update team verification status
                setTimeout(() => {
                    window.location.href = "/student/dashboard"
                }, 2000)
            } else {
                toast.success("SRS uploaded successfully", {
                    description: "Your document has been uploaded and is being processed."
                })
                fetchTeamData() // Refresh team data
            }
        } catch (err: any) {
            console.error("Submit error:", err)
            toast.error("Submission Failed", {
                description: err.message || "An unexpected error occurred. Please try again."
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </GradientBackground>
        )
    }

    // If no team, show create/join options
    if (!team) {
        return (
            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold">Team Setup</h1>
                            <p className="text-muted-foreground">
                                Choose whether to join an existing team or create a new one
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/student/join-team")}>
                                <CardHeader className="text-center">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <CardTitle>Join Existing Team</CardTitle>
                                    <CardDescription>
                                        Enter a team code to join an existing team
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" onClick={() => router.push("/student/join-team")}>
                                        Join Team
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/student/create-team")}>
                                <CardHeader className="text-center">
                                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-6 h-6 text-green-600" />
                                    </div>
                                    <CardTitle>Create New Team</CardTitle>
                                    <CardDescription>
                                        Start a new team and become the team leader
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button className="w-full" onClick={() => router.push("/student/create-team")}>
                                        Create Team
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </GradientBackground>
        )
    }

    const memberCount = team.memberships.length
    const canSubmit = memberCount === 4 && githubLink && srsFile

    return (
        <GradientBackground>
            <div className="min-h-screen p-4 md:p-8">
                {/* Header */}
                <div className="max-w-7xl mx-auto mb-6">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-4xl font-bold mb-2">DETAILS</h1>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
                    {/* Left Side - Project Details Form */}
                    <Card className="bg-white/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Instructions</CardTitle>
                            <CardDescription className="space-y-2 text-sm">
                                <p>Project Manager wish to know the following for evaluating your application.</p>
                                <p className="font-semibold">Idea Submission *</p>
                                <p className="font-semibold">Procedure</p>
                                <p>Each Team, or Participant (in case of solo participation) is requested to upload their idea presentation in a .pdf format. This very ppt shall be used for evaluation therefore please ensure to pre_presentation.</p>
                                <p className="font-semibold">NOTE: ONLY ONE MEMBER PER TEAM (PREFERABLY THE TEAM LEADER SHOULD UPLOAD THE IDEA)</p>
                                <p className="font-semibold">Steps:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Create a folder in google drive with your team name.</li>
                                    <li>If you are an individual you can give your name.</li>
                                    <li>Put your idea presentation in the google drive link</li>
                                    <li>Make it publicly shareable</li>
                                    <li>Paste the link, in the given input box</li>
                                </ol>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="presentation">Presentation Link</Label>
                                <Input
                                    id="presentation"
                                    placeholder="_bits_init_.pdf"
                                    value={presentationLink}
                                    onChange={(e) => setPresentationLink(e.target.value)}
                                    disabled={team.isValidated}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub</Label>
                                <Input
                                    id="github"
                                    placeholder="https://github.com/_bits_init_"
                                    value={githubLink}
                                    onChange={(e) => setGithubLink(e.target.value)}
                                    disabled={team.isValidated}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="srs">SRS Document (PDF)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="srs"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        disabled={team.isValidated}
                                        className="cursor-pointer"
                                    />
                                    {srsFile && (
                                        <Badge variant="secondary">{srsFile.name}</Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Right Side - Team Members & Submission */}
                    <div className="space-y-6">
                        {/* Team Illustration Card */}
                        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            <CardContent className="p-8 flex items-center justify-center">
                                <div className="text-center">
                                    <Users className="h-24 w-24 mx-auto mb-4 opacity-80" />
                                    <p className="text-lg font-semibold">{team.name}</p>
                                    <p className="text-sm opacity-90">{team.department}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team Members */}
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Team Members ({memberCount}/4)</span>
                                    {!team.isValidated && (
                                        <Button variant="outline" size="sm" onClick={handleLeaveTeam}>
                                            Leave Team
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {team.memberships.map((member, index) => {
                                    const initials = member.studentProfile.user.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "?"

                                    const isCurrentUser = session?.user?.id === member.studentProfile.userId

                                    return (
                                        <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                                            <Avatar>
                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold flex items-center gap-2">
                                                    {member.studentProfile.user.name || "Unknown"}
                                                    {isCurrentUser && (
                                                        <Badge variant="outline" className="text-xs">you</Badge>
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.role === "LEADER" ? "leader" : member.role === "MEMBER" ? "registered" : "not registered"}
                                                </p>
                                            </div>
                                            {member.role === "LEADER" && (
                                                <Badge variant="default">Leader</Badge>
                                            )}
                                        </div>
                                    )
                                })}

                                {/* Empty slots */}
                                {Array.from({ length: 4 - memberCount }).map((_, index) => (
                                    <div key={`empty-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 opacity-50">
                                        <Avatar>
                                            <AvatarFallback className="bg-gray-300">?</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-400">Waiting for member...</p>
                                            <p className="text-sm text-gray-400">not registered</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Invite Code */}
                        {!team.isValidated && (
                            <Card className="bg-white/90 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Invite Code</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={team.code}
                                            readOnly
                                            className="font-mono text-lg text-center"
                                        />
                                        <Button variant="outline" size="icon" onClick={handleCopyCode}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {success && (
                                        <p className="text-sm text-green-600 mt-2">{success}</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Submit Button */}
                        <Card className="bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <Button
                                    className="w-full h-14 text-lg"
                                    disabled={!canSubmit || isSubmitting || team.isValidated}
                                    onClick={handleSubmitTeam}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Validating Team...
                                        </>
                                    ) : team.isValidated ? (
                                        "Team Validated ✓"
                                    ) : (
                                        "Register Team"
                                    )}
                                </Button>

                                {!canSubmit && !team.isValidated && (
                                    <p className="text-sm text-muted-foreground mt-3 text-center">
                                        {memberCount < 4 && `Need ${4 - memberCount} more member(s). `}
                                        {!githubLink && "GitHub link required. "}
                                        {!srsFile && "SRS document required."}
                                    </p>
                                )}

                                {team.isValidated && (
                                    <p className="text-sm text-green-600 mt-3 text-center">
                                        Your team has been validated and approved!
                                    </p>
                                )}

                                {error && (
                                    <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </GradientBackground>
    )
}
