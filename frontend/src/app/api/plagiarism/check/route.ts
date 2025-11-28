import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify user is a student
        if (session.user.role !== 'STUDENT') {
            return NextResponse.json(
                { error: "Only students can check plagiarism" },
                { status: 403 }
            )
        }

        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            )
        }

        // Validate file type (PDF only)
        if (!file.type.includes('pdf')) {
            return NextResponse.json(
                { error: "Only PDF files are allowed" },
                { status: 400 }
            )
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size must be less than 10MB" },
                { status: 400 }
            )
        }

        // Forward to Python plagiarism service
        const plagiarismFormData = new FormData()
        plagiarismFormData.append('file', file)

        const plagiarismServiceUrl = process.env.PLAGIARISM_SERVICE_URL || 'http://localhost:5001'

        console.log(`Sending plagiarism check request to ${plagiarismServiceUrl}`)

        const response = await fetch(`${plagiarismServiceUrl}/check-plagiarism`, {
            method: 'POST',
            body: plagiarismFormData,
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Plagiarism service error:', errorText)
            throw new Error('Plagiarism service returned an error')
        }

        const result = await response.json()

        console.log('Plagiarism check result:', result)

        // Check if plagiarism detected (score > 0)
        const isPlagiarized = result.max_score > 0

        return NextResponse.json({
            success: true,
            plagiarismDetected: isPlagiarized,
            score: result.max_score,
            scorePercentage: Math.round(result.max_score * 100),
            matchedFiles: result.matched_files || [],
            threshold: result.threshold || 0.80,
            documentAdded: result.document_added || false,
            message: isPlagiarized
                ? `Plagiarism detected (${Math.round(result.max_score * 100)}% similarity)`
                : 'No plagiarism detected - document is unique'
        })

    } catch (error: any) {
        console.error("Error checking plagiarism:", error)

        // If plagiarism service is unavailable, return a specific error
        if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    error: "Plagiarism service is currently unavailable. Please try again later.",
                    serviceDown: true
                },
                { status: 503 }
            )
        }

        return NextResponse.json(
            { error: "Failed to check plagiarism" },
            { status: 500 }
        )
    }
}
