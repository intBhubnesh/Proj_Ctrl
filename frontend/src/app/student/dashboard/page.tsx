"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile')
  const [weeklyReport, setWeeklyReport] = useState({
    content: "",
    images: [] as File[]
  })

  const studentData = {
    name: "John Doe",
    email: "john.doe@example.com",
    erpNumber: "ERP123456",
    department: "Computer Science",
    team: {
      name: "Tech Innovators",
      code: "TEAM123ABC",
      members: 4,
      role: "Frontend Developer"
    },
    project: {
      title: "Student Management System",
      technology: "React, Node.js",
      domain: "Web Development",
      status: "Approved"
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + weeklyReport.images.length <= 3) {
      setWeeklyReport(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }))
    }
  }

  const removeImage = (index: number) => {
    setWeeklyReport(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const submitWeeklyReport = () => {
    if (weeklyReport.content.length < 200) {
      alert("Report must be at least 200 words")
      return
    }
    // TODO: Submit weekly report
    console.log("Submitting weekly report:", weeklyReport)
    setWeeklyReport({ content: "", images: [] })
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'project', label: 'Project Details', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'assessment', label: 'Assessment', icon: '📊' },
    { id: 'reports', label: 'Weekly Reports', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Student Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {studentData.name}</p>
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
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal and academic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <p className="font-medium">{studentData.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{studentData.email}</p>
                    </div>
                    <div>
                      <Label>ERP Number</Label>
                      <p className="font-medium">{studentData.erpNumber}</p>
                    </div>
                    <div>
                      <Label>Department</Label>
                      <p className="font-medium">{studentData.department}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Team Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Team Name</Label>
                        <p className="font-medium">{studentData.team.name}</p>
                      </div>
                      <div>
                        <Label>Team Code</Label>
                        <p className="font-medium font-mono">{studentData.team.code}</p>
                      </div>
                      <div>
                        <Label>Your Role</Label>
                        <p className="font-medium">{studentData.team.role}</p>
                      </div>
                      <div>
                        <Label>Team Size</Label>
                        <p className="font-medium">{studentData.team.members}/4 members</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'project' && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>Information about your submitted project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Project Title</Label>
                      <p className="font-medium">{studentData.project.title}</p>
                    </div>
                    <div>
                      <Label>Technology Stack</Label>
                      <p className="font-medium">{studentData.project.technology}</p>
                    </div>
                    <div>
                      <Label>Domain</Label>
                      <p className="font-medium">{studentData.project.domain}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {studentData.project.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'reports' && (
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Reports</CardTitle>
                  <CardDescription>Submit your weekly progress report (200 words minimum)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportContent">Report Content</Label>
                    <textarea
                      id="reportContent"
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe your weekly progress, challenges faced, and next steps..."
                      value={weeklyReport.content}
                      onChange={(e) => setWeeklyReport(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      {weeklyReport.content.length}/200 words minimum
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Images (1-3 images)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={weeklyReport.images.length >= 3}
                    />
                    {weeklyReport.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {weeklyReport.images.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={submitWeeklyReport}
                    disabled={weeklyReport.content.length < 200}
                  >
                    Submit Weekly Report
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Placeholder for other tabs */}
            {['notifications', 'assessment', 'settings'].includes(activeTab) && (
              <Card>
                <CardHeader>
                  <CardTitle>{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
                  <CardDescription>This section is under development</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Content for {activeTab} will be implemented soon.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
