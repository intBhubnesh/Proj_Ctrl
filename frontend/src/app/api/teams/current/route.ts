import { NextRequest, NextResponse } from "next/server"
import { requireStudent } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const { session, error } = await requireStudent()
        if (error) return error

        // Get student profile with current team
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                currentTeam: {
                    include: {
                        memberships: {
                            where: { leftAt: null },
                            include: {
                                studentProfile: {
                                    include: {
                                        user: true
                                    }
                                }
                            },
                            orderBy: {
                                joinedAt: 'asc'
                            }
                        },
                        leader: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        },
                        project: {
                            include: {
                                submissions: {
                                    include: {
                                        reportFile: true
                                    },
                                    orderBy: {
                                        createdAt: 'desc'
                                    },
                                    take: 1
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!studentProfile) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            )
        }

        if (!studentProfile.currentTeam) {
            return NextResponse.json({
                hasTeam: false,
                team: null
            })
        }

        const team = studentProfile.currentTeam

        // Format team data
        const teamData = {
            id: team.id,
            name: team.name,
            code: team.code,
            department: team.department,
            isValidated: team.isValidated,
            createdAt: team.createdAt,
            leader: team.leader,
            memberships: team.memberships.map(m => ({
                id: m.id,
                role: m.role,
                studentProfile: {
                    id: m.studentProfile.id,
                    userId: m.studentProfile.userId,
                    user: {
                        id: m.studentProfile.user.id,
                        name: m.studentProfile.user.name,
                        email: m.studentProfile.user.email,
                    }
                }
            })),
            memberCount: team.memberships.length,
            hasProject: !!team.project,
            project: team.project ? {
                id: team.project.id,
                domain: team.project.domain,
                technology: team.project.technology,
                problemStatement: team.project.problemStatement,
                repoUrl: team.project.repoUrl,
                pptUrl: team.project.pptUrl,
                srsReport: team.project.submissions[0]?.reportFile ? {
                    fileName: team.project.submissions[0].reportFile.fileName
                } : null,
                latestSubmission: team.project.submissions[0] || null
            } : null
        }

        return NextResponse.json({
            hasTeam: true,
            team: teamData
        })

    } catch (error) {
        console.error("Error fetching team details:", error)
        return NextResponse.json(
            { error: "Failed to fetch team details" },
            { status: 500 }
        )
    }
}
