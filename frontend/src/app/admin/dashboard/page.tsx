"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    LayoutDashboard,
    Users,
    FileText,
    Award,
    Settings,
    Search,
    MoreHorizontal,
    Star,
    ChevronRight,
    Bell,
    LogOut
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

interface TeamMember {
    id: string
    userId: string
    name: string
    email: string
    enrollmentNo: string
    role: string
    declaredRole: string | null
    joinedAt: string
}

interface Team {
    id: string
    name: string
    code: string
    department: string
    createdAt: string
    leader: {
        id: string
        name: string
        email: string
        enrollmentNo: string
    }
    memberCount: number
    members: TeamMember[]
    hasProject: boolean
    project: {
        id: string
        technology: string
        domain: string
        problemStatement: string
        pptUrl: string | null
        submissionCount: number
        latestSubmission: {
            id: string
            attemptNo: number
            status: string
            createdAt: string
            plagiarismReport: {
                similarityPct: number
                status: string
            } | null
        } | null
    } | null
}

export default function AdminDashboard() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState('teams')
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9

    useEffect(() => {
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/teams')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch teams')
            }

            setTeams(data.teams)
        } catch (err: any) {
            setError(err.message || 'Failed to load teams')
        } finally {
            setIsLoading(false)
        }
    }

    const getTeamRating = (team: Team) => {
        if (!team.project?.latestSubmission?.plagiarismReport) return 0
        const similarity = team.project.latestSubmission.plagiarismReport.similarityPct
        return Math.max(0, 5 - Math.floor(similarity / 20))
    }

    const getTeamGradient = (index: number) => {
        const gradients = [
            'from-purple-400 to-pink-400',
            'from-blue-400 to-cyan-400',
            'from-green-400 to-emerald-400',
            'from-orange-400 to-red-400',
            'from-indigo-400 to-purple-400',
            'from-pink-400 to-rose-400',
        ]
        return gradients[index % gradients.length]
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'teams', label: 'Teams', icon: Users },
        { id: 'projects', label: 'Projects', icon: FileText },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'reports', label: 'Reports', icon: Award },
        { id: 'settings', label: 'Settings', icon: Settings }
    ]

    const totalPages = Math.ceil(teams.length / itemsPerPage)
    const paginatedTeams = teams.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, teams.length)

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">BF</span>
                        </div>
                        <span className="font-semibold text-lg">BrainFlow</span>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Ask or Search..." className="pl-9 bg-gray-50 border-gray-200" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${activeTab === tab.id ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={session?.user?.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                {session?.user?.name?.charAt(0) || 'A'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {session?.user?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">Admin</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/auth/login' })} className="h-8 w-8">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <span>Dashboard</span>
                                    <span>/</span>
                                    <span className="text-gray-900 font-medium">
                                        {activeTab === 'teams' ? 'Teams' : 'Dashboard'}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {activeTab === 'teams' ? 'Team List' : 'Dashboard Overview'}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                </Button>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <span>Create New</span>
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {activeTab === 'teams' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">Team List</h2>
                                        <p className="text-sm text-gray-500">Total teams: {teams.length}</p>
                                    </div>
                                </div>

                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">
                                    <div className="col-span-3">TEAMS</div>
                                    <div className="col-span-2">RATING</div>
                                    <div className="col-span-2">TOTAL MEMBERS</div>
                                    <div className="col-span-2">DEPARTMENT</div>
                                    <div className="col-span-2">CREATED DATE</div>
                                    <div className="col-span-1">ACTIONS</div>
                                </div>

                                {/* Loading State */}
                                {isLoading && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Loading teams...</p>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <div className="text-center py-8">
                                        <p className="text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoading && !error && paginatedTeams.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No teams found</p>
                                    </div>
                                )}

                                {/* Teams List */}
                                {!isLoading && !error && paginatedTeams.map((team, index) => (
                                    <div key={team.id} className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center">
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${getTeamGradient(index)} rounded-lg flex items-center justify-center`}>
                                                <span className="text-white font-bold text-sm">{team.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{team.name}</p>
                                                <p className="text-xs text-gray-500">{team.project?.technology || 'No tech'}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1">
                                            <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                                            <span className="font-medium text-gray-900">{getTeamRating(team)}.0</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-900">{team.memberCount}/4</span>
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant="outline" className="text-xs">{team.department}</Badge>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-sm text-gray-600">{new Date(team.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="col-span-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {!isLoading && !error && totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            Showing {startItem} - {endItem} of {teams.length} items in one page
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {activeTab !== 'teams' && (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-gray-500">This section is under development</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
