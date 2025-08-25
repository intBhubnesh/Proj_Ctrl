"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function TeamSetupPage() {
  const router = useRouter()

  const handleJoinTeam = () => {
    router.push("/student/join-team")
  }

  const handleCreateTeam = () => {
    router.push("/student/create-team")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Team Setup</h1>
          <p className="text-muted-foreground">
            Choose whether to join an existing team or create a new one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Join Team Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleJoinTeam}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <CardTitle>Join Existing Team</CardTitle>
              <CardDescription>
                Enter a team code to join an existing team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enter team code provided by team leader</li>
                <li>• Maximum 4 members per team</li>
                <li>• Must be from same department</li>
              </ul>
              <Button className="w-full mt-4" onClick={handleJoinTeam}>
                Join Team
              </Button>
            </CardContent>
          </Card>

          {/* Create Team Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateTeam}>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <CardTitle>Create New Team</CardTitle>
              <CardDescription>
                Start a new team and become the team leader
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You will become the team leader</li>
                <li>• Generate team code for others to join</li>
                <li>• Manage team submissions</li>
              </ul>
              <Button className="w-full mt-4" onClick={handleCreateTeam}>
                Create Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
