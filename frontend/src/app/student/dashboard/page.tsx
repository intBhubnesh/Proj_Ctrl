"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AuthStatus from "@/components/auth/auth-status"
import GradientBackground from "@/components/ui/gradient-background"
import { toast } from "sonner"
import { Loader2, Bell, Calendar, Users, GitBranch, FileText, Award, Edit2, Save, X, BookOpen, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { authFetch, authPost, authPatch, authDelete } from "@/lib/api-client"

interface DashboardData {
    student: {
        id: string
        userId: string
        enrollmentNumber: string
        department: string
        semester: number
        division: number
        institution: string
        course: string
        user: {
            id: string
            name: string | null
            email: string
        }
    }
    team: {
        id: string
        name: string
        code: string
        department: string
        isValidated: boolean
        isVerified: boolean
        validatedAt: Date | null
        createdAt: Date
        memberCount: number
        userRole: string
        isLeader: boolean
        members: any[]
        mentor: any
    } | null
    project: {
        id: string
        technology: string
        domain: string
        problemStatement: string
        repoUrl: string | null
        pptUrl: string | null
        srsReport: {
            id: string
            fileName: string
            storageUrl: string
        } | null
        plagiarismScore: number | null
        plagiarismStatus: string | null
        latestSubmission: any
        assessments: any[]
    } | null
    notifications: any[]
}

export default function StudentDashboard() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [activeTab, setActiveTab] = useState('team')
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editedProject, setEditedProject] = useState({
        repoUrl: '',
        technology: '',
        domain: '',
        problemStatement: '',
        pptUrl: ''
    })

    // Weekly Reports State
    const [weeklyReports, setWeeklyReports] = useState<any[]>([])
    const [isLoadingReports, setIsLoadingReports] = useState(false)
    const [isSubmittingReport, setIsSubmittingReport] = useState(false)
    const [newReport, setNewReport] = useState({
        weekLabel: '',
        content: '',
        imageUrls: ['']
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin')
        } else if (status === 'authenticated') {
            fetchDashboardData()
        }
    }, [status, router])

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true)
            const response = await authFetch('/api/student/dashboard')

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const data = await response.json()
            setDashboardData(data)

            // Initialize edit form with current project data
            if (data.project) {
                setEditedProject({
                    repoUrl: data.project.repoUrl || '',
                    technology: data.project.technology || '',
                    domain: data.project.domain || '',
                    problemStatement: data.project.problemStatement || '',
                    pptUrl: data.project.pptUrl || ''
                })
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditProject = () => {
        setIsEditing(true)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        // Reset to original values
        if (dashboardData?.project) {
            setEditedProject({
                repoUrl: dashboardData.project.repoUrl || '',
                technology: dashboardData.project.technology || '',
                domain: dashboardData.project.domain || '',
                problemStatement: dashboardData.project.problemStatement || '',
                pptUrl: dashboardData.project.pptUrl || ''
            })
        }
    }

    const handleSaveProject = async () => {
        try {
            setIsSaving(true)
            const response = await authPatch('/api/student/project/update', editedProject)

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update project')
            }

            toast.success('Project details updated successfully')
            setIsEditing(false)
            await fetchDashboardData()
        } catch (error: any) {
            console.error('Error updating project:', error)
            toast.error(error.message || 'Failed to update project')
        } finally {
            setIsSaving(false)
        }
    }

    const markNotificationAsRead = async (notificationId: string) => {
        try {
            await authPost('/api/student/notifications/read', { notificationId })
            await fetchDashboardData()
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await authPatch('/api/student/notifications/read')
            toast.success('All notifications marked as read')
            await fetchDashboardData()
        } catch (error) {
            console.error('Error marking all as read:', error)
            toast.error('Failed to mark notifications as read')
        }
    }

    const fetchWeeklyReports = async () => {
        try {
            setIsLoadingReports(true)
            const response = await authFetch('/api/student/weekly-reports')

            if (!response.ok) {
                throw new Error('Failed to fetch weekly reports')
            }

            const data = await response.json()
            setWeeklyReports(data.weeklyReports || [])
        } catch (error) {
            console.error('Error fetching weekly reports:', error)
            toast.error('Failed to load weekly reports')
        } finally {
            setIsLoadingReports(false)
        }
    }

    const submitWeeklyReport = async () => {
        try {
            // Validate
            if (!newReport.weekLabel || !newReport.content) {
                toast.error('Week label and content are required')
                return
            }

            const wordCount = newReport.content.trim().split(/\s+/).length
            if (wordCount > 200) {
                toast.error('Content must be 200 words or less')
                return
            }

            const validImageUrls = newReport.imageUrls.filter(url => url.trim() !== '')
            if (validImageUrls.length < 1 || validImageUrls.length > 3) {
                toast.error('Please provide 1-3 image URLs')
                return
            }

            setIsSubmittingReport(true)
            const response = await authPost('/api/student/weekly-reports', {
                weekLabel: newReport.weekLabel,
                content: newReport.content,
                imageUrls: validImageUrls
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to submit report')
            }

            toast.success('Weekly report submitted successfully!')
            setNewReport({ weekLabel: '', content: '', imageUrls: [''] })
            await fetchWeeklyReports()
        } catch (error: any) {
            console.error('Error submitting report:', error)
            toast.error(error.message || 'Failed to submit weekly report')
        } finally {
            setIsSubmittingReport(false)
        }
    }

    const deleteWeeklyReport = async (reportId: string) => {
        try {
            const response = await authDelete(`/api/student/weekly-reports/${reportId}`)

            if (!response.ok) {
                throw new Error('Failed to delete report')
            }

            toast.success('Report deleted successfully')
            await fetchWeeklyReports()
        } catch (error) {
            console.error('Error deleting report:', error)
            toast.error('Failed to delete report')
        }
    }

    useEffect(() => {
        if (activeTab === 'reports') {
            fetchWeeklyReports()
        }
    }, [activeTab])

    const tabs = [
        { id: 'team', label: 'Team Details', icon: Users },
        { id: 'reports', label: 'Weekly Reports', icon: BookOpen },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'assessment', label: 'Assessments', icon: Award }
    ]

    if (isLoading || status === 'loading') {
        return (
            <GradientBackground>
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </GradientBackground>
        )
    }

    if (!dashboardData) {
        return (
            <GradientBackground>
                <div className="flex items-center justify-center min-h-screen">
                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg p-6">
                        <p className="text-muted-foreground">No dashboard data available</p>
                    </Card>
                </div>
            </GradientBackground>
        )
    }

    const unreadCount = dashboardData.notifications.filter(n => !n.readAt).length

    return (
        <GradientBackground>
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Student Dashboard</h1>
                            <p className="text-muted-foreground">Welcome back, {dashboardData.student.user.name}</p>
                        </div>
                        <AuthStatus />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                            <CardContent className="p-0">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                                    activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''
                                                }`}
                                            >
                                                <Icon className="mr-3 h-5 w-5" />
                                                <span className="flex-1">{tab.label}</span>
                                                {tab.id === 'notifications' && unreadCount > 0 && (
                                                    <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                                                )}
                                            </button>
                                        )
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Team Details Tab */}
                        {activeTab === 'team' && (
                            <div className="space-y-6">
                                {/* Team Info Card */}
                                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Team Information
                                        </CardTitle>
                                        <CardDescription>Your team details and members</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {dashboardData.team ? (
                                            <>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label>Team Name</Label>
                                                        <p className="font-medium">{dashboardData.team.name}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Team Code</Label>
                                                        <p className="font-medium font-mono">{dashboardData.team.code}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Department</Label>
                                                        <p className="font-medium">{dashboardData.team.department}</p>
                                                    </div>
                                                    <div>
                                                        <Label>Your Role</Label>
                                                        <Badge variant={dashboardData.team.isLeader ? "default" : "secondary"}>
                                                            {dashboardData.team.userRole}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <Label>Team Status</Label>
                                                        <div className="flex gap-2">
                                                            {dashboardData.team.isVerified && (
                                                                <Badge variant="default" className="bg-green-600">Verified</Badge>
                                                            )}
                                                            {dashboardData.team.isValidated && (
                                                                <Badge variant="default" className="bg-blue-600">Validated</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Members</Label>
                                                        <p className="font-medium">{dashboardData.team.memberCount}/4</p>
                                                    </div>
                                                </div>

                                                {dashboardData.team.mentor && (
                                                    <div className="border-t pt-4">
                                                        <Label>Assigned Mentor</Label>
                                                        <p className="font-medium">{dashboardData.team.mentor.name}</p>
                                                        <p className="text-sm text-muted-foreground">{dashboardData.team.mentor.email}</p>
                                                    </div>
                                                )}

                                                <div className="border-t pt-4">
                                                    <Label className="mb-3 block">Team Members</Label>
                                                    <div className="space-y-2">
                                                        {dashboardData.team.members.map((member: any) => (
                                                            <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div>
                                                                    <p className="font-medium">{member.student.user.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{member.student.enrollmentNumber}</p>
                                                                </div>
                                                                <Badge variant={member.role === 'LEADER' ? 'default' : 'secondary'}>
                                                                    {member.role}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">You are not part of any team yet.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Project Details Card */}
                                {dashboardData.project && (
                                    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <FileText className="h-5 w-5" />
                                                        Project Details
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {dashboardData.team?.isLeader ? 'Manage your project information' : 'View your project information'}
                                                    </CardDescription>
                                                </div>
                                                {dashboardData.team?.isLeader && !isEditing && (
                                                    <Button onClick={handleEditProject} variant="outline" size="sm">
                                                        <Edit2 className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                )}
                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <Button onClick={handleSaveProject} size="sm" disabled={isSaving}>
                                                            {isSaving ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Save className="h-4 w-4 mr-2" />
                                                            )}
                                                            Save
                                                        </Button>
                                                        <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isSaving}>
                                                            <X className="h-4 w-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label>Technology Stack</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedProject.technology}
                                                            onChange={(e) => setEditedProject(prev => ({ ...prev, technology: e.target.value }))}
                                                            placeholder="e.g., React, Node.js, MongoDB"
                                                        />
                                                    ) : (
                                                        <p className="font-medium">{dashboardData.project.technology}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label>Domain</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedProject.domain}
                                                            onChange={(e) => setEditedProject(prev => ({ ...prev, domain: e.target.value }))}
                                                            placeholder="e.g., Web Development, AI/ML"
                                                        />
                                                    ) : (
                                                        <p className="font-medium">{dashboardData.project.domain}</p>
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Label>Problem Statement</Label>
                                                    {isEditing ? (
                                                        <textarea
                                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                            value={editedProject.problemStatement}
                                                            onChange={(e) => setEditedProject(prev => ({ ...prev, problemStatement: e.target.value }))}
                                                            placeholder="Describe the problem your project solves"
                                                        />
                                                    ) : (
                                                        <p className="font-medium">{dashboardData.project.problemStatement}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label className="flex items-center gap-2">
                                                        <GitBranch className="h-4 w-4" />
                                                        GitHub Repository URL
                                                    </Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedProject.repoUrl}
                                                            onChange={(e) => setEditedProject(prev => ({ ...prev, repoUrl: e.target.value }))}
                                                            placeholder="https://github.com/username/repo"
                                                        />
                                                    ) : (
                                                        dashboardData.project.repoUrl ? (
                                                            <a href={dashboardData.project.repoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                                                {dashboardData.project.repoUrl}
                                                            </a>
                                                        ) : (
                                                            <p className="text-muted-foreground">Not provided</p>
                                                        )
                                                    )}
                                                </div>
                                                <div>
                                                    <Label>PPT URL</Label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={editedProject.pptUrl}
                                                            onChange={(e) => setEditedProject(prev => ({ ...prev, pptUrl: e.target.value }))}
                                                            placeholder="https://..."
                                                        />
                                                    ) : (
                                                        dashboardData.project.pptUrl ? (
                                                            <a href={dashboardData.project.pptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                                                {dashboardData.project.pptUrl}
                                                            </a>
                                                        ) : (
                                                            <p className="text-muted-foreground">Not provided</p>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {dashboardData.project.srsReport && (
                                                <div className="border-t pt-4">
                                                    <Label>SRS Report</Label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">{dashboardData.project.srsReport.fileName}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {dashboardData.project.plagiarismScore !== null && (
                                                <div className="border-t pt-4">
                                                    <Label>Plagiarism Check Result</Label>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div>
                                                            <p className="text-2xl font-bold">
                                                                {Math.round(dashboardData.project.plagiarismScore)}%
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">Similarity Score</p>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                dashboardData.project.plagiarismScore < 30 ? 'default' :
                                                                dashboardData.project.plagiarismScore < 60 ? 'secondary' :
                                                                'destructive'
                                                            }
                                                            className={
                                                                dashboardData.project.plagiarismScore < 30 ? 'bg-green-600' :
                                                                dashboardData.project.plagiarismScore < 60 ? 'bg-yellow-600' :
                                                                ''
                                                            }
                                                        >
                                                            {dashboardData.project.plagiarismStatus}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Bell className="h-5 w-5" />
                                                Notifications
                                            </CardTitle>
                                            <CardDescription>
                                                Messages from admins, mentors, and system updates
                                            </CardDescription>
                                        </div>
                                        {unreadCount > 0 && (
                                            <Button onClick={markAllAsRead} variant="outline" size="sm">
                                                Mark all as read
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData.notifications.length > 0 ? (
                                        <div className="space-y-3">
                                            {dashboardData.notifications.map((un: any) => (
                                                <div
                                                    key={un.id}
                                                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                                                        un.readAt ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                                                    }`}
                                                    onClick={() => !un.readAt && markNotificationAsRead(un.notification.id)}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold">{un.notification.title}</h4>
                                                                {!un.readAt && (
                                                                    <Badge variant="default" className="text-xs">New</Badge>
                                                                )}
                                                                {un.notification.priority === 'HIGH' && (
                                                                    <Badge variant="destructive" className="text-xs">Important</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                {un.notification.message}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span>From: {un.notification.createdBy.name} ({un.notification.createdBy.role})</span>
                                                                <span>•</span>
                                                                <span>{new Date(un.notification.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">No notifications yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Weekly Reports Tab */}
                        {activeTab === 'reports' && (
                            <div className="space-y-6">
                                {/* Submit New Report Card */}
                                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Submit Weekly Report
                                        </CardTitle>
                                        <CardDescription>
                                            Share your team's progress (max 200 words, 1-3 images)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="weekLabel">Week Label</Label>
                                            <Input
                                                id="weekLabel"
                                                placeholder="e.g., Week 3 or 2025-W12"
                                                value={newReport.weekLabel}
                                                onChange={(e) => setNewReport({ ...newReport, weekLabel: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="content">Report Content (max 200 words)</Label>
                                            <Textarea
                                                id="content"
                                                placeholder="Describe what your team accomplished this week..."
                                                value={newReport.content}
                                                onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                                                rows={6}
                                                className="resize-none"
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {newReport.content.trim().split(/\s+/).filter(w => w).length} / 200 words
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Image URLs (1-3 required)</Label>
                                            {newReport.imageUrls.map((url, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        placeholder={`Image URL ${index + 1}`}
                                                        value={url}
                                                        onChange={(e) => {
                                                            const newUrls = [...newReport.imageUrls]
                                                            newUrls[index] = e.target.value
                                                            setNewReport({ ...newReport, imageUrls: newUrls })
                                                        }}
                                                    />
                                                    {index > 0 && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => {
                                                                const newUrls = newReport.imageUrls.filter((_, i) => i !== index)
                                                                setNewReport({ ...newReport, imageUrls: newUrls })
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {newReport.imageUrls.length < 3 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setNewReport({ ...newReport, imageUrls: [...newReport.imageUrls, ''] })}
                                                >
                                                    Add Image URL
                                                </Button>
                                            )}
                                        </div>

                                        <Button
                                            onClick={submitWeeklyReport}
                                            disabled={isSubmittingReport}
                                            className="w-full"
                                        >
                                            {isSubmittingReport ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                'Submit Report'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Previous Reports */}
                                <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Previous Reports
                                        </CardTitle>
                                        <CardDescription>View your team's submitted weekly reports</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoadingReports ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                            </div>
                                        ) : weeklyReports.length > 0 ? (
                                            <div className="space-y-4">
                                                {weeklyReports.map((report: any) => (
                                                    <div key={report.id} className="p-4 rounded-lg border bg-gray-50">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="font-semibold text-lg">{report.weekLabel}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    By {report.author.name} • {new Date(report.createdAt).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            {report.authorUserId === session?.user?.id && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => deleteWeeklyReport(report.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <p className="text-sm mb-3 whitespace-pre-wrap">{report.content}</p>
                                                        {report.imageUrls && report.imageUrls.length > 0 && (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {report.imageUrls.map((url: string, idx: number) => (
                                                                    <img
                                                                        key={idx}
                                                                        src={url}
                                                                        alt={`Report image ${idx + 1}`}
                                                                        className="rounded-lg border w-full h-32 object-cover"
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                                <p className="text-muted-foreground">No weekly reports yet</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Submit your first weekly report above
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Assessments Tab */}
                        {activeTab === 'assessment' && (
                            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5" />
                                        Assessments
                                    </CardTitle>
                                    <CardDescription>View your project assessments and scores</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dashboardData.project?.assessments && dashboardData.project.assessments.length > 0 ? (
                                        <div className="space-y-4">
                                            {dashboardData.project.assessments.map((assessment: any) => (
                                                <div key={assessment.id} className="p-4 rounded-lg border bg-gray-50">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant={
                                                                    assessment.status === 'ASSESSED' ? 'default' :
                                                                    assessment.status === 'IN_PROGRESS' ? 'secondary' :
                                                                    'outline'
                                                                }>
                                                                    {assessment.status}
                                                                </Badge>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {new Date(assessment.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Assessed by: {assessment.mentor.name}
                                                            </p>
                                                        </div>
                                                        {assessment.totalMarks !== null && (
                                                            <div className="text-right">
                                                                <p className="text-2xl font-bold text-blue-600">
                                                                    {assessment.totalMarks}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">Total Marks</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {assessment.remarks && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <Label className="text-xs">Remarks</Label>
                                                            <p className="text-sm mt-1">{assessment.remarks}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-muted-foreground">No assessments yet</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Your mentor will assess your project soon
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </GradientBackground>
    )
}
