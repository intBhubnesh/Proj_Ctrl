"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function VerifyPage() {
  const [email, setEmail] = useState("")
  const [erpNumber, setErpNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleVerification = async () => {
    setIsLoading(true)
    // TODO: Implement email verification and ERP lookup
    console.log("Verifying:", { email, erpNumber })
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Redirect based on user type
      router.push("/student/team-setup")
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Verify Your Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to verify your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="erp">ERP Number</Label>
            <Input
              id="erp"
              type="text"
              placeholder="Enter your ERP number"
              value={erpNumber}
              onChange={(e) => setErpNumber(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleVerification}
            disabled={!email || !erpNumber || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Account"}
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={() => router.back()}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
