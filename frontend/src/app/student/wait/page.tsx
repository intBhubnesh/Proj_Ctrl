"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type CheckStatus = 'checking' | 'passed' | 'failed' | 'resubmit'

export default function WaitPage() {
  const [status, setStatus] = useState<CheckStatus>('checking')
  const [plagiarismScore, setPlagiarismScore] = useState(0)
  const [uniqueIdea, setUniqueIdea] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Simulate plagiarism check
    const timer = setTimeout(() => {
      const score = Math.random() * 100
      setPlagiarismScore(score)
      
      if (score > 80) {
        setStatus('failed')
      } else {
        setStatus('passed')
        // Auto redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/student/dashboard')
        }, 3000)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  const handleUniqueIdeaSubmit = async () => {
    if (!uniqueIdea.trim()) return

    setIsSubmitting(true)
    
    // TODO: Submit unique idea for validation
    console.log("Submitting unique idea:", uniqueIdea)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setStatus('checking')
      setUniqueIdea("")
      
      // Simulate recheck
      setTimeout(() => {
        setStatus('passed')
        setTimeout(() => {
          router.push('/student/dashboard')
        }, 3000)
      }, 3000)
    }, 2000)
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <CardTitle>Plagiarism Check in Progress</CardTitle>
            <CardDescription>
              Please wait while we verify your project submission
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                This process may take a few minutes. We're checking your project against existing submissions and online sources.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-sm text-muted-foreground">Analyzing submission...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'passed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-green-900">Submission Approved!</CardTitle>
            <CardDescription>
              Your project has passed the plagiarism check
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                Plagiarism Score: <span className="font-bold">{plagiarismScore.toFixed(1)}%</span>
              </p>
              <p className="text-xs text-green-700">
                Your submission meets our originality requirements
              </p>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard in a few seconds...
            </p>
            
            <Button onClick={() => router.push('/student/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <CardTitle className="text-red-900">Submission Rejected</CardTitle>
            <CardDescription>
              High plagiarism detected in your submission
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800 mb-2">
                Plagiarism Score: <span className="font-bold">{plagiarismScore.toFixed(1)}%</span>
              </p>
              <p className="text-xs text-red-700">
                Score must be below 80% to qualify
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="uniqueIdea">Provide Unique Idea Description</Label>
              <textarea
                id="uniqueIdea"
                className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe what makes your project unique and original..."
                value={uniqueIdea}
                onChange={(e) => setUniqueIdea(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleUniqueIdeaSubmit}
              disabled={!uniqueIdea.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Unique Idea"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
