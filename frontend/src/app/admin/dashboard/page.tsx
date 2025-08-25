"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface Team {
  id: string
  name: string
  code: string
  leader: string
  members: string[]
  department: string
  project: {
    title: string
    technology: string
    domain: string
    status: string
  }
  mentor: string
  score: number
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('teams')
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const teams: Team[] = [
    {
      id: "1",
      name: "Tech Innovators",
      code: "TEAM123ABC",
      leader: "John Doe",
      members: ["John Doe", "Jane Smith", "Mike Wilson", "Sarah Davis"],
      department: "Computer Science",
      project: {
        title: "Student Management System",
        technology: "React, Node.js",
        domain: "Web Development",
        status: "In Progress"
      },
      mentor: "Dr. Sarah Johnson",
      score: 85
    },
    {
      id: "2",
      name: "AI Pioneers",
      code: "TEAM456DEF",
      leader: "Alex Brown",
      members: ["Alex Brown", "Emma Johnson", "David Lee"],
      department: "Computer Science",
      project: {
        title: "Smart Recommendation Engine",
        technology: "Python, TensorFlow",
        domain: "AI/ML",
        status: "Submitted"
      },
      mentor: "Dr. Sarah Johnson",
      score: 92
    },
    {
      id: "3",
      name: "Mobile Masters",
      code: "TEAM789GHI",
      leader: "Lisa Wang",
      members: ["Lisa Wang", "Tom Chen", "Amy Rodriguez", "Kevin Park"],
      department: "Information Technology",
      project: {
        title: "Fitness Tracking App",
        technology: "Flutter, Firebase",
        domain: "Mobile Development",
        status: "Approved"
      },
      mentor: "Dr. Michael Brown",
      score: 78
    }
  ]

  const departments = ["Computer Science", "Information Technology", "Software Engineering"]
  const statuses = ["Approved", "In Progress", "Submitted", "Rejected"]

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.leader.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !filterDepartment || team.department === filterDepartment
    const matchesStatus = !filterStatus || team.project.status === filterStatus
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const exportToExcel = () => {
    // TODO: Implement Excel export
    console.log("Exporting teams to Excel...")
  }

  const tabs = [
    { id: 'teams', label: 'Teams Management', icon: '👥' },
    { id: 'assessments', label: 'Create Assessment', icon: '📊' },
    { id: 'reports', label: 'All Reports', icon: '📝' },
    { id: 'mentors', label: 'Manage Mentors', icon: '👨‍🏫' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage teams, mentors, and assessments</p>
            </div>
            <Button variant="outline">Logout</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                        activeTab === tab.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : ''
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Teams</span>
                  <span className="font-semibold">{teams.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Projects</span>
                  <span className="font-semibold">{teams.filter(t => t.project.status === 'In Progress').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span className="font-semibold">{teams.filter(t => t.project.status === 'Submitted').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Score</span>
                  <span className="font-semibold">{Math.round(teams.reduce((acc, t) => acc + t.score, 0) / teams.length)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'teams' && (
              <div className="space-y-6">
                {/* Filters and Search */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Teams Management</CardTitle>
                        <CardDescription>View and manage all project teams</CardDescription>
                      </div>
                      <Button onClick={exportToExcel}>
                        Export to Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="search">Search</Label>
                        <Input
                          id="search"
                          placeholder="Search teams..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <select
                          id="department"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                        >
                          <option value="">All Departments</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                          id="status"
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          {statuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm("")
                            setFilterDepartment("")
                            setFilterStatus("")
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Teams List */}
                <div className="space-y-4">
                  {filteredTeams.map((team) => (
                    <Card key={team.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <CardDescription>
                              {team.code} • Led by {team.leader} • {team.department}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-2xl font-bold text-blue-600">{team.score}/100</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label>Project</Label>
                            <p className="font-medium">{team.project.title}</p>
                            <p className="text-sm text-muted-foreground">{team.project.technology}</p>
                          </div>
                          <div>
                            <Label>Domain</Label>
                            <p className="font-medium">{team.project.domain}</p>
                          </div>
                          <div>
                            <Label>Mentor</Label>
                            <p className="font-medium">{team.mentor}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label>Team Members ({team.members.length}/4)</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {team.members.map((member, index) => (
                              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                                {member}
                                {member === team.leader && " (Leader)"}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            team.project.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            team.project.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            team.project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {team.project.status}
                          </span>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">View Details</Button>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredTeams.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No teams found matching your criteria</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Placeholder for other tabs */}
            {['assessments', 'reports', 'mentors', 'analytics'].includes(activeTab) && (
              <Card>
                <CardHeader>
                  <CardTitle>{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
                  <CardDescription>This section is under development</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Content for {activeTab} will be implemented soon.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
