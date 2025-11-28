import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import FormData from "form-data"
import fetch from "node-fetch"
import { readFile } from "fs/promises"
import { join } from "path"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userRole = (session.user as any).role
        if (userRole !== 'STUDENT') {
            return NextResponse.json({ error: "Only students can submit teams" }, { status: 403 })
        }

        const body = await req.json()
        const { teamId, githubLink, presentationLink, srsFileId } = body

        if (!teamId || !githubLink || !srsFileId) {
            return NextResponse.json({
                error: "Team ID, GitHub link, and SRS file are required"
            }, { status: 400 })
        }

        console.log('🔵 Team Submit API - Request received')
        console.log('📦 Team ID:', teamId)
        console.log('🔗 GitHub:', githubLink)
        console.log('📄 SRS File ID:', srsFileId)

        // Get team with all members
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                memberships: {
                    include: {
                        studentProfile: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                project: true
            }
        })

        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 })
        }

        // Verify user is part of the team
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!studentProfile || studentProfile.currentTeamId !== teamId) {
            return NextResponse.json({ error: "You are not part of this team" }, { status: 403 })
        }

        // Check if team already validated
        if (team.isValidated) {
            return NextResponse.json({
                error: "Team is already validated"
            }, { status: 400 })
        }

        // Validate team has exactly 4 members
        if (team.memberships.length !== 4) {
            return NextResponse.json({
                error: `Team must have exactly 4 members. Current: ${team.memberships.length}`
            }, { status: 400 })
        }

        console.log('✅ Team has 4 members')

        // Check all members are unique and not in other validated teams
        const memberUserIds = team.memberships.map(m => m.studentProfile.userId)

        const otherTeamMemberships = await prisma.teamMembership.findMany({
            where: {
                studentProfile: {
                    userId: {
                        in: memberUserIds
                    }
                },
                teamId: {
                    not: teamId
                },
                team: {
                    isValidated: true
                }
            },
            include: {
                studentProfile: {
                    include: {
                        user: true
                    }
                },
                team: true
            }
        })

        if (otherTeamMemberships.length > 0) {
            const conflictingMembers = otherTeamMemberships.map(m => ({
                name: m.studentProfile.user.name,
                team: m.team.name
            }))

            return NextResponse.json({
                error: "Some team members are already in validated teams",
                conflicts: conflictingMembers
            }, { status: 400 })
        }

        console.log('✅ All members are unique')

        // Get SRS file
        const srsFile = await prisma.projectFile.findUnique({
            where: { id: srsFileId }
        })

        if (!srsFile) {
            return NextResponse.json({ error: "SRS file not found" }, { status: 404 })
        }

        console.log('📄 SRS file found:', srsFile.fileName)

        // Check plagiarism
        console.log('🔍 Starting plagiarism check...')

        const plagiarismServiceUrl = process.env.PLAGIARISM_SERVICE_URL || 'http://localhost:5001'

        try {
            // Read the file from disk
            const filePath = join(process.cwd(), srsFile.storageUrl)
            const fileBuffer = await readFile(filePath)

            // Create form data for plagiarism check
            const formData = new FormData()
            formData.append('file', fileBuffer, {
                filename: srsFile.fileName,
                contentType: srsFile.mimeType
            })

            // Call plagiarism service
            const plagiarismResponse = await fetch(`${plagiarismServiceUrl}/check-plagiarism`, {
                method: 'POST',
                body: formData as any,
                headers: formData.getHeaders()
            })

            if (!plagiarismResponse.ok) {
                console.error('❌ Plagiarism service error:', plagiarismResponse.statusText)
                throw new Error('Plagiarism check service unavailable')
            }

            const plagiarismResult = await plagiarismResponse.json() as any

            console.log('📊 Plagiarism check result:', plagiarismResult)

            // Check if plagiarism detected
            if (plagiarismResult.plagiarism_detected) {
                console.log('❌ Plagiarism detected!')

                // Create plagiarism report
                const submission = await prisma.submission.create({
                    data: {
                        projectId: team.project?.id || '',
                        attemptNo: 1,
                        status: 'FLAGGED',
                        submittedByUserId: session.user.id,
                        reportFileId: srsFileId
                    }
                })

                await prisma.plagiarismReport.create({
                    data: {
                        submissionId: submission.id,
                        status: 'FLAGGED',
                        similarityScore: plagiarismResult.max_score,
                        matchedSources: plagiarismResult.matched_files || [],
                        detectionMethod: 'AI_VECTOR_SIMILARITY',
                        checkedAt: new Date()
                    }
                })

                // Update team submission timestamp but don't validate
                await prisma.team.update({
                    where: { id: teamId },
                    data: {
                        submittedAt: new Date()
                    }
                })

                return NextResponse.json({
                    status: 'rejected',
                    message: `Plagiarism detected (${(plagiarismResult.max_score * 100).toFixed(1)}% similarity). Matched files: ${plagiarismResult.matched_files?.join(', ')}. Please submit original work.`,
                    plagiarismScore: plagiarismResult.max_score,
                    matchedFiles: plagiarismResult.matched_files
                }, { status: 200 })
            }

            console.log('✅ No plagiarism detected')

            // Create or update project
            let project = team.project
            if (!project) {
                project = await prisma.project.create({
                    data: {
                        teamId: team.id,
                        technology: '', // Will be filled later
                        domain: '', // Will be filled later
                        problemStatement: '', // Will be filled later
                        repoUrl: githubLink,
                        pptUrl: presentationLink,
                        srsReportId: srsFileId
                    }
                })
            } else {
                project = await prisma.project.update({
                    where: { id: project.id },
                    data: {
                        repoUrl: githubLink,
                        pptUrl: presentationLink,
                        srsReportId: srsFileId
                    }
                })
            }

            // Create successful submission
            const submission = await prisma.submission.create({
                data: {
                    projectId: project.id,
                    attemptNo: 1,
                    status: 'CLEAN',
                    submittedByUserId: session.user.id,
                    reportFileId: srsFileId
                }
            })

            // Create plagiarism report (clean)
            await prisma.plagiarismReport.create({
                data: {
                    submissionId: submission.id,
                    status: 'CLEAN',
                    similarityScore: plagiarismResult.max_score || 0,
                    matchedSources: [],
                    detectionMethod: 'AI_VECTOR_SIMILARITY',
                    checkedAt: new Date()
                }
            })

            // Validate the team
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    isValidated: true,
                    submittedAt: new Date(),
                    validatedAt: new Date()
                }
            })

            console.log('🎉 Team validated successfully!')

            return NextResponse.json({
                status: 'approved',
                message: 'Team validated successfully! Your project has been approved.',
                team: {
                    id: team.id,
                    name: team.name,
                    isValidated: true
                },
                plagiarismScore: plagiarismResult.max_score || 0
            })

        } catch (plagiarismError: any) {
            console.error('❌ Plagiarism check failed:', plagiarismError)

            // If plagiarism service is down, allow submission but mark for manual review
            return NextResponse.json({
                status: 'pending',
                message: 'Plagiarism check service is currently unavailable. Your submission has been queued for manual review.',
                error: plagiarismError.message
            }, { status: 503 })
        }

    } catch (error) {
        console.error("❌ Error submitting team:", error)
        return NextResponse.json(
            { error: "Failed to submit team" },
            { status: 500 }
        )
    }
}
