import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify user is an admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: "Only admins can view all teams" },
                { status: 403 }
            )
        }

        // Get all teams with complete information
        const teams = await prisma.team.findMany({
            include: {
                leader: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        enrollmentNo: true
                    }
                },
                memberships: {
                    where: { leftAt: null },
                    include: {
                        studentProfile: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        enrollmentNo: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        joinedAt: 'asc'
                    }
                },
                project: {
                    include: {
                        submissions: {
                            include: {
                                plagiarismReport: true
                            },
                            orderBy: {
                                createdAt: 'desc'
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Format the data
        const formattedTeams = teams.map(team => ({
            id: team.id,
            name: team.name,
            code: team.code,
            department: team.department,
            createdAt: team.createdAt,
            leader: team.leader,
            memberCount: team.memberships.length,
            members: team.memberships.map(m => ({
                id: m.id,
                userId: m.studentProfile.userId,
                name: m.studentProfile.user.name,
                email: m.studentProfile.user.email,
                enrollmentNo: m.studentProfile.user.enrollmentNo,
                role: m.role,
                declaredRole: m.memberDeclaredRole,
                joinedAt: m.joinedAt
            })),
            hasProject: !!team.project,
            project: team.project ? {
                id: team.project.id,
                technology: team.project.technology,
                domain: team.project.domain,
                problemStatement: team.project.problemStatement,
                pptUrl: team.project.pptUrl,
                submissionCount: team.project.submissions.length,
                latestSubmission: team.project.submissions[0] ? {
                    id: team.project.submissions[0].id,
                    attemptNo: team.project.submissions[0].attemptNo,
                    status: team.project.submissions[0].status,
                    createdAt: team.project.submissions[0].createdAt,
                    plagiarismReport: team.project.submissions[0].plagiarismReport ? {
                        similarityPct: team.project.submissions[0].plagiarismReport.similarityPct,
                        status: team.project.submissions[0].plagiarismReport.status
                    } : null
                } : null
            } : null
        }))

        return NextResponse.json({
            success: true,
            teams: formattedTeams,
            totalTeams: formattedTeams.length,
            totalStudents: formattedTeams.reduce((sum, team) => sum + team.memberCount, 0)
        })

    } catch (error) {
        console.error("Error fetching teams:", error)
        return NextResponse.json(
            { error: "Failed to fetch teams" },
            { status: 500 }
        )
    }
}
