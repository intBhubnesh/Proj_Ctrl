"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('assigned-teams')
  const [assessmentData, setAssessmentData] = useState({
    teamId: "",
    score: "",
    comments: ""
  })

  const teacherData = {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    department: "Computer Science",
    domains: ["Web Development", "AI/ML", "Data Science"],
    technologies: ["React", "Python", "TensorFlow", "Node.js"]
  }

  const assignedTeams = [
    {
      id: "1",
      name: "Tech Innovators",
      code: "TEAM123ABC",
      members: ["John Doe", "Jane Smith", "Mike Wilson", "Sarah Davis"],
      project: {
        title: "Student Management System",
        technology: "React, Node.js",
        domain: "Web Development",
        status: "In Progress"
      },
      currentScore: 85
    },
    {
      id: "2",
      name: "AI Pioneers",
      code: "TEAM456DEF",
      members: ["Alex Brown", "Emma Johnson", "David Lee"],
      project: {
        title: "Smart Recommendation Engine",
        technology: "Python, TensorFlow",
        domain: "AI/ML",
        status: "Submitted"
      },
      currentScore: 92
    }
  ]

  const weeklyReports = [
    {
      id: "1",
      teamName: "Tech Innovators",
      week: "Week 3",
      submittedBy: "John Doe",
      content: "This week we completed the user authentication module and started working on the dashboard interface. We faced some challenges with JWT token management but resolved them by implementing proper middleware...",
      images: 2,
      submittedAt: "2024-01-15"
    },
    {
      id: "2",
      teamName: "AI Pioneers",
      week: "Week 3",
      submittedBy: "Alex Brown",
      content: "We made significant progress on the recommendation algorithm. The model training is showing promising results with 89% accuracy. Next week we plan to integrate the model with the web interface...",
      images: 3,
      submittedAt: "2024-01-14"
    }
  ]

  const handleAssessment = (teamId: string) => {
    setAssessmentData({ ...assessmentData, teamId })
  }

  const submitAssessment = () => {
    if (!assessmentData.score || !assessmentData.comments) {
      alert("Please provide both score and comments")
      return
    }
    
    // TODO: Submit assessment
    console.log("Submitting assessment:", assessmentData)
    setAssessmentData({ teamId: "", score: "", comments: "" })
  }

  const tabs = [
    { id: 'assigned-teams', label: 'Assigned Teams', icon: '👥' },
    { id: 'assessment', label: 'Assessment', icon: '📊' },
    { id: 'reports', label: 'Weekly Reports', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {teacherData.name}</p>
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'assigned-teams' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assigned Teams</CardTitle>
                    <CardDescription>Teams you are mentoring this semester</CardDescription>
                  </CardHeader>
                </Card>
                
                {assignedTeams.map((team) => (
                  <Card key={team.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{team.name}</CardTitle>
                          <CardDescription>Team Code: {team.code}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Current Score</p>
                          <p className="text-2xl font-bold text-blue-600">{team.currentScore}/100</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Project Title</Label>
                          <p className="font-medium">{team.project.title}</p>
                        </div>
                        <div>
                          <Label>Technology</Label>
                          <p className="font-medium">{team.project.technology}</p>
                        </div>
                        <div>
                          <Label>Domain</Label>
                          <p className="font-medium">{team.project.domain}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            team.project.status === 'Submitted' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {team.project.status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Team Members ({team.members.length}/4)</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {team.members.map((member, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                              {member}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAssessment(team.id)}>
                          Assess Team
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'assessment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Assessment</CardTitle>
                  <CardDescription>Provide scores and feedback for teams</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamSelect">Select Team</Label>
                    <select
                      id="teamSelect"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      value={assessmentData.teamId}
                      onChange={(e) => setAssessmentData(prev => ({ ...prev, teamId: e.target.value }))}
                    >
                      <option value="">Choose a team...</option>
                      {assignedTeams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="score">Score (0-100)</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Enter score"
                      value={assessmentData.score}
                      onChange={(e) => setAssessmentData(prev => ({ ...prev, score: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments & Feedback</Label>
                    <textarea
                      id="comments"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Provide detailed feedback..."
                      value={assessmentData.comments}
                      onChange={(e) => setAssessmentData(prev => ({ ...prev, comments: e.target.value }))}
                    />
                  </div>

                  <Button onClick={submitAssessment}>
                    Submit Assessment
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Reports</CardTitle>
                    <CardDescription>Review weekly progress reports from your teams</CardDescription>
                  </CardHeader>
                </Card>

                {weeklyReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{report.teamName} - {report.week}</CardTitle>
                          <CardDescription>Submitted by {report.submittedBy} on {report.submittedAt}</CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {report.images} images attached
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{report.content}</p>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">View Images</Button>
                        <Button size="sm" variant="outline">Provide Feedback</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your teaching profile and expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <p className="font-medium">{teacherData.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{teacherData.email}</p>
                    </div>
                    <div>
                      <Label>Department</Label>
                      <p className="font-medium">{teacherData.department}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Domain Expertise</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacherData.domains.map((domain) => (
                          <span key={domain} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Technology Knowledge</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {teacherData.technologies.map((tech) => (
                          <span key={tech} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Recent updates and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No new notifications</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
