"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [teamCode, setTeamCode] = useState("")
  const router = useRouter()

  const generateTeamCode = () => {
    return "TEAM" + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      return
    }

    setIsLoading(true)
    
    // TODO: Implement team creation logic
    console.log("Creating team:", teamName)
    
    // Simulate API call
    setTimeout(() => {
      const generatedCode = generateTeamCode()
      setTeamCode(generatedCode)
      setIsLoading(false)
    }, 2000)
  }

  const handleContinue = () => {
    router.push("/student/project-submission")
  }

  const copyTeamCode = () => {
    navigator.clipboard.writeText(teamCode)
    // TODO: Show toast notification
  }

  if (teamCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Team Created!</CardTitle>
            <CardDescription className="text-center">
              Your team has been successfully created
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800 mb-2">Team Name:</p>
                <p className="font-semibold text-green-900">{teamName}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">Team Code:</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="font-mono text-lg font-bold text-blue-900">{teamCode}</code>
                  <Button size="sm" variant="outline" onClick={copyTeamCode}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Share this code with your team members
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">As Team Leader:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• You can manage team submissions</li>
                <li>• Maximum 4 members including you</li>
                <li>• All members must be from your department</li>
              </ul>
            </div>

            <Button className="w-full" onClick={handleContinue}>
              Continue to Project Submission
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
