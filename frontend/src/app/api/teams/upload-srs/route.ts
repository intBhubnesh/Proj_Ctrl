import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userRole = (session.user as any).role
        if (userRole !== 'STUDENT') {
            return NextResponse.json({ error: "Only students can upload SRS files" }, { status: 403 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File
        const teamId = formData.get("teamId") as string

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        if (!teamId) {
            return NextResponse.json({ error: "Team ID required" }, { status: 400 })
        }

        // Verify user is part of the team and get team details
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                currentTeam: {
                    include: {
                        memberships: {
                            include: {
                                studentProfile: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!studentProfile || studentProfile.currentTeamId !== teamId) {
            return NextResponse.json({
                error: "You are not part of this team",
                type: "PERMISSION_ERROR"
            }, { status: 403 })
        }

        const team = studentProfile.currentTeam
        if (!team) {
            return NextResponse.json({
                error: "Team not found",
                type: "NOT_FOUND"
            }, { status: 404 })
        }

        // Validate team criteria before allowing SRS upload
        // 1. Check if team has exactly 4 members
        const memberCount = team.memberships.length
        if (memberCount !== 4) {
            return NextResponse.json({
                error: `Team must have exactly 4 members. Current: ${memberCount}/4`,
                type: "TEAM_SIZE_ERROR",
                currentMembers: memberCount,
                requiredMembers: 4,
                action: "Please invite more members to your team or remove extra members."
            }, { status: 400 })
        }

        // 2. Check if all members are from the same department/branch
        const departments = new Set(team.memberships.map(m => m.studentProfile.department))
        if (departments.size > 1) {
            return NextResponse.json({
                error: "All team members must be from the same department/branch",
                type: "DEPARTMENT_MISMATCH",
                departments: Array.from(departments),
                action: "Please ensure all team members are from the same department."
            }, { status: 400 })
        }

        // 3. Check if all members are from the same institution
        const institutions = new Set(team.memberships.map(m => m.studentProfile.institution).filter(Boolean))
        if (institutions.size > 1) {
            return NextResponse.json({
                error: "All team members must be from the same institution",
                type: "INSTITUTION_MISMATCH",
                institutions: Array.from(institutions),
                action: "Please ensure all team members are from the same institution."
            }, { status: 400 })
        }

        // Verify file is PDF
        if (file.type !== "application/pdf") {
            return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads", "srs-reports")
        await mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Calculate SHA256 hash
        const hash = crypto.createHash("sha256").update(buffer).digest("hex")
        const fileExtension = file.name.split(".").pop()
        const uniqueFilename = `${teamId}-${Date.now()}.${fileExtension}`
        const filePath = join(uploadsDir, uniqueFilename)

        // Save file
        await writeFile(filePath, buffer)

        // Create ProjectFile record
        const projectFile = await prisma.projectFile.create({
            data: {
                storageUrl: `/uploads/srs-reports/${uniqueFilename}`,
                fileName: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
                sha256: hash,
                uploadedByUserId: session.user.id
            }
        })

        // Get or Create Project for the team
        let project = await prisma.project.findUnique({
            where: { teamId }
        })

        if (!project) {
            // Create a placeholder project if it doesn't exist
            project = await prisma.project.create({
                data: {
                    teamId,
                    technology: "Pending",
                    domain: "Pending",
                    problemStatement: "Pending"
                }
            })
        }

        // Calculate attempt number
        const existingSubmissions = await prisma.submission.count({
            where: { projectId: project.id }
        })
        const attemptNo = existingSubmissions + 1

        // Create Submission
        const submission = await prisma.submission.create({
            data: {
                projectId: project.id,
                submittedByUserId: session.user.id,
                attemptNo,
                reportFileId: projectFile.id,
                status: 'CHECKING'
            }
        })

        // Call Plagiarism Checker Service
        const plagiarismServiceUrl = process.env.PLAGIARISM_SERVICE_URL || 'http://localhost:5001'

        try {
            // Create a new FormData for the plagiarism service
            const plagiarismFormData = new FormData()
            // Re-create the file blob for the plagiarism service
            const fileBlob = new Blob([buffer], { type: file.type })
            plagiarismFormData.append('file', fileBlob, file.name)

            console.log(`📤 Sending file to plagiarism checker: ${plagiarismServiceUrl}/check-plagiarism`)

            const plagiarismResponse = await fetch(`${plagiarismServiceUrl}/check-plagiarism`, {
                method: 'POST',
                body: plagiarismFormData,
                headers: {
                    'Accept': 'application/json'
                }
            })

            if (plagiarismResponse.ok) {
                const plagiarismResult = await plagiarismResponse.json()
                console.log('✅ Plagiarism check result:', plagiarismResult)

                // Extract similarity percentage from the plagiarism API response
                // The API returns: { plagiarism_detected: boolean, max_score: number, matched_files: [], threshold: number }
                const maxScore = plagiarismResult.max_score || 0
                const similarityPct = Math.round(maxScore * 100) // Convert to percentage
                const plagiarismDetected = plagiarismResult.plagiarism_detected || false

                // Determine plagiarism status based on similarity
                let plagiarismStatus: 'CLEAN' | 'SUSPICIOUS' | 'PLAGIARIZED'
                if (similarityPct < 30) {
                    plagiarismStatus = 'CLEAN'
                } else if (similarityPct < 60) {
                    plagiarismStatus = 'SUSPICIOUS'
                } else {
                    plagiarismStatus = 'PLAGIARIZED'
                }

                // Create Plagiarism Report
                await prisma.plagiarismReport.create({
                    data: {
                        submissionId: submission.id,
                        similarityPct,
                        status: plagiarismStatus,
                        reasonsJson: JSON.stringify({
                            matched_files: plagiarismResult.matched_files || [],
                            threshold: plagiarismResult.threshold || 0.6,
                            plagiarism_detected: plagiarismDetected
                        }),
                        summary: plagiarismDetected
                            ? `Plagiarism detected with ${similarityPct}% similarity`
                            : `No plagiarism detected. Similarity: ${similarityPct}%`,
                        modelVersion: 'v1.0',
                        datasetTag: 'pinecone-vector-db'
                    }
                })

                // Update Submission status
                const submissionStatus = similarityPct < 60 ? 'CLEAN' : 'FLAGGED'
                await prisma.submission.update({
                    where: { id: submission.id },
                    data: { status: submissionStatus }
                })

                // Update Team Verification Status
                // Team is verified if similarity < 60%
                if (similarityPct < 60) {
                    await prisma.team.update({
                        where: { id: teamId },
                        data: {
                            isVerified: true,
                            isValidated: true,
                            validatedAt: new Date()
                        }
                    })
                    console.log(`✅ Team ${teamId} verified! Similarity: ${similarityPct}%`)

                    return NextResponse.json({
                        success: true,
                        verified: true,
                        fileId: projectFile.id,
                        fileName: file.name,
                        submissionId: submission.id,
                        plagiarismCheck: {
                            similarityPct,
                            status: plagiarismStatus,
                            verified: true,
                            message: `Congratulations! Your team has been verified. Plagiarism score: ${similarityPct}%`
                        }
                    })
                } else {
                    console.log(`⚠️ Team ${teamId} NOT verified. Similarity: ${similarityPct}% (threshold: 60%)`)

                    return NextResponse.json({
                        success: true,
                        verified: false,
                        fileId: projectFile.id,
                        fileName: file.name,
                        submissionId: submission.id,
                        plagiarismCheck: {
                            similarityPct,
                            status: plagiarismStatus,
                            verified: false,
                            message: `Team verification failed. Plagiarism score (${similarityPct}%) exceeds the 60% threshold.`,
                            action: "Please revise your SRS document to reduce similarity and resubmit."
                        },
                        error: `Plagiarism score too high: ${similarityPct}%. Must be below 60% to verify team.`,
                        type: "PLAGIARISM_THRESHOLD_EXCEEDED"
                    }, { status: 400 })
                }
            } else {
                const errorText = await plagiarismResponse.text()
                console.error('❌ Plagiarism service error:', errorText)

                // Update submission to indicate check failed
                await prisma.submission.update({
                    where: { id: submission.id },
                    data: { status: 'PENDING_CHECK' }
                })

                return NextResponse.json({
                    success: false,
                    error: 'Plagiarism check service returned an error',
                    type: 'PLAGIARISM_SERVICE_ERROR',
                    message: 'The plagiarism detection service encountered an error while processing your file.',
                    action: 'This is a system issue. Please try again in a few minutes or contact the administrator if the problem persists.',
                    fileId: projectFile.id,
                    fileName: file.name,
                    submissionId: submission.id
                }, { status: 503 })
            }
        } catch (plagiarismError) {
            console.error("❌ Plagiarism check failed:", plagiarismError)

            // Update submission status
            await prisma.submission.update({
                where: { id: submission.id },
                data: { status: 'PENDING_CHECK' }
            })

            return NextResponse.json({
                success: false,
                error: 'Unable to connect to plagiarism detection service',
                type: 'PLAGIARISM_SERVICE_UNAVAILABLE',
                message: 'The plagiarism detection service is currently unavailable.',
                action: 'This is a system issue. Please contact the administrator. Your file has been saved and will be checked once the service is available.',
                fileId: projectFile.id,
                fileName: file.name,
                submissionId: submission.id
            }, { status: 503 })
        }
    } catch (error) {
        console.error("Error uploading SRS file:", error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return NextResponse.json({
            error: "Failed to upload SRS file",
            type: "UPLOAD_ERROR",
            message: errorMessage,
            action: "Please try again. If the problem persists, contact the administrator."
        }, { status: 500 })
    }
}
