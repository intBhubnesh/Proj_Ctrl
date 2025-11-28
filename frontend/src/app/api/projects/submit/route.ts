import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { uploadFile, validateFile } from "@/lib/file-upload"
import { SubmissionStatus, PlagiarismStatus } from "@prisma/client"

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
                { error: "Only students can submit projects" },
                { status: 403 }
            )
        }

        const formData = await req.formData()

        // Extract form fields
        const technology = formData.get('technology') as string
        const domain = formData.get('domain') as string
        const problemStatement = formData.get('problemStatement') as string
        const pptUrl = formData.get('pptUrl') as string
        const srsFile = formData.get('srsFile') as File
        const teamMembersJson = formData.get('teamMembers') as string

        // Validate required fields
        if (!technology || !domain || !problemStatement || !srsFile) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate SRS file
        const fileValidation = validateFile(srsFile)
        if (!fileValidation.valid) {
            return NextResponse.json(
                { error: fileValidation.error },
                { status: 400 }
            )
        }

        // Get student's team
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                currentTeam: {
                    include: {
                        memberships: {
                            where: { leftAt: null },
                            include: {
                                studentProfile: {
                                    include: { user: true }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!studentProfile || !studentProfile.currentTeam) {
            return NextResponse.json(
                { error: "You must be part of a team to submit a project" },
                { status: 400 }
            )
        }

        const team = studentProfile.currentTeam

        // CRITICAL VALIDATION: Check if any team member is in another team
        for (const membership of team.memberships) {
            const student = membership.studentProfile
            if (student.currentTeamId !== team.id) {
                return NextResponse.json(
                    {
                        error: `Team member ${student.user.name} is part of another team. All members must leave other teams before submission.`,
                        conflictingMember: student.user.name
                    },
                    { status: 400 }
                )
            }
        }

        // Upload SRS file
        console.log('Uploading SRS file...')
        const uploadedFile = await uploadFile(srsFile)

        // Check plagiarism
        console.log('Checking plagiarism...')
        const plagiarismFormData = new FormData()
        plagiarismFormData.append('file', srsFile)

        const plagiarismServiceUrl = process.env.PLAGIARISM_SERVICE_URL || 'http://localhost:5000'
        const plagiarismResponse = await fetch(`${plagiarismServiceUrl}/check-plagiarism`, {
            method: 'POST',
            body: plagiarismFormData,
        })

        if (!plagiarismResponse.ok) {
            throw new Error('Plagiarism service unavailable')
        }

        const plagiarismResult = await plagiarismResponse.json()
        console.log('Plagiarism result:', plagiarismResult)

        // Check if plagiarism detected (score > 0)
        if (plagiarismResult.max_score > 0) {
            return NextResponse.json(
                {
                    success: false,
                    plagiarismDetected: true,
                    score: plagiarismResult.max_score,
                    scorePercentage: Math.round(plagiarismResult.max_score * 100),
                    matchedFiles: plagiarismResult.matched_files || [],
                    message: `Plagiarism detected! Your SRS has ${Math.round(plagiarismResult.max_score * 100)}% similarity with existing submissions.`
                },
                { status: 400 }
            )
        }

        // Parse team members roles
        let teamMembers: Array<{ userId: string; role: string }> = []
        if (teamMembersJson) {
            try {
                teamMembers = JSON.parse(teamMembersJson)
            } catch (e) {
                console.error('Failed to parse team members:', e)
            }
        }

        // Create project submission with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create ProjectFile record
            const projectFile = await tx.projectFile.create({
                data: {
                    storageUrl: uploadedFile.storageUrl,
                    fileName: uploadedFile.fileName,
                    mimeType: uploadedFile.mimeType,
                    sizeBytes: uploadedFile.sizeBytes,
                    sha256: uploadedFile.sha256,
                    uploadedByUserId: session.user.id
                }
            })

            // Create or update Project
            const project = await tx.project.upsert({
                where: { teamId: team.id },
                create: {
                    teamId: team.id,
                    technology,
                    domain,
                    problemStatement,
                    pptUrl: pptUrl || null,
                    srsReportId: projectFile.id
                },
                update: {
                    technology,
                    domain,
                    problemStatement,
                    pptUrl: pptUrl || null,
                    srsReportId: projectFile.id
                }
            })

            // Get current submission count for attempt number
            const submissionCount = await tx.submission.count({
                where: { projectId: project.id }
            })

            // Create Submission record
            const submission = await tx.submission.create({
                data: {
                    projectId: project.id,
                    submittedByUserId: session.user.id,
                    attemptNo: submissionCount + 1,
                    status: SubmissionStatus.CLEAN,
                    reportFileId: projectFile.id,
                    repoUrl: null,
                    notes: 'Initial submission - passed plagiarism check'
                }
            })

            // Create PlagiarismReport record
            await tx.plagiarismReport.create({
                data: {
                    submissionId: submission.id,
                    similarityPct: plagiarismResult.max_score * 100,
                    status: PlagiarismStatus.CLEAN,
                    reasonsJson: {
                        matched_files: plagiarismResult.matched_files || [],
                        threshold: plagiarismResult.threshold || 0.80,
                        message: 'No plagiarism detected'
                    },
                    modelVersion: 'text-embedding-3-small',
                    datasetTag: 'pinecone-v1',
                    summary: 'Document is unique and has no significant similarity with existing submissions.'
                }
            })

            // Update team member roles if provided
            if (teamMembers.length > 0) {
                for (const member of teamMembers) {
                    await tx.teamMembership.updateMany({
                        where: {
                            teamId: team.id,
                            studentProfile: {
                                userId: member.userId
                            }
                        },
                        data: {
                            memberDeclaredRole: member.role
                        }
                    })
                }
            }

            return { project, projectFile, submission }
        })

        console.log('Project submission created successfully')

        return NextResponse.json({
            success: true,
            message: 'Project submitted successfully! No plagiarism detected.',
            project: result.project
        })

    } catch (error: any) {
        console.error("Error submitting project:", error)
        return NextResponse.json(
            { error: error.message || "Failed to submit project" },
            { status: 500 }
        )
    }
}
