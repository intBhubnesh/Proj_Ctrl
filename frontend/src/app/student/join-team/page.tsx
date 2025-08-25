"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JoinTeamPage() {
  const [teamCode, setTeamCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      setError("Please enter a team code")
      return
    }

    setIsLoading(true)
    setError("")

    // TODO: Implement team joining logic
    console.log("Joining team with code:", teamCode)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Check if team is valid and has space
      if (teamCode === "INVALID") {
        setError("Invalid team code or team is full")
      } else {
        router.push("/student/project-submission")
      }
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Join Team</CardTitle>
          <CardDescription className="text-center">
            Enter the team code provided by your team leader
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamCode">Team Code</Label>
            <Input
              id="teamCode"
              type="text"
              placeholder="Enter team code (e.g., TEAM123)"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Team Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Maximum 4 members per team</li>
              <li>• All members must be from the same department</li>
              <li>• You cannot be part of multiple teams</li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            onClick={handleJoinTeam}
            disabled={!teamCode.trim() || isLoading}
          >
            {isLoading ? "Joining Team..." : "Join Team"}
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
