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
                { error: "Only admins can export data" },
                { status: 403 }
            )
        }

        // Get export format from query params
        const { searchParams } = new URL(req.url)
        const format = searchParams.get('format') || 'json' // json or csv

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
                            },
                            take: 1
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (format === 'csv') {
            // Generate CSV
            const csvRows: string[] = []

            // Header
            csvRows.push([
                'Team Name',
                'Team Code',
                'Department',
                'Leader Name',
                'Leader Email',
                'Leader Enrollment',
                'Member Count',
                'Has Project',
                'Project Technology',
                'Project Domain',
                'Plagiarism Score (%)',
                'Plagiarism Status',
                'Submission Status',
                'Created At'
            ].join(','))

            // Data rows
            for (const team of teams) {
                const latestSubmission = team.project?.submissions[0]
                csvRows.push([
                    `"${team.name}"`,
                    team.code,
                    team.department,
                    `"${team.leader.name || ''}"`,
                    team.leader.email || '',
                    team.leader.enrollmentNo || '',
                    team.memberships.length.toString(),
                    team.project ? 'Yes' : 'No',
                    team.project ? `"${team.project.technology}"` : '',
                    team.project ? `"${team.project.domain}"` : '',
                    latestSubmission?.plagiarismReport?.similarityPct?.toString() || '',
                    latestSubmission?.plagiarismReport?.status || '',
                    latestSubmission?.status || '',
                    team.createdAt.toISOString()
                ].join(','))
            }

            const csv = csvRows.join('\n')

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="teams-export-${Date.now()}.csv"`
                }
            })
        }

        // JSON format (default)
        const exportData = teams.map(team => ({
            teamName: team.name,
            teamCode: team.code,
            department: team.department,
            leader: {
                name: team.leader.name,
                email: team.leader.email,
                enrollmentNo: team.leader.enrollmentNo
            },
            members: team.memberships.map(m => ({
                name: m.studentProfile.user.name,
                email: m.studentProfile.user.email,
                enrollmentNo: m.studentProfile.user.enrollmentNo,
                role: m.memberDeclaredRole || m.role,
                joinedAt: m.joinedAt
            })),
            project: team.project ? {
                technology: team.project.technology,
                domain: team.project.domain,
                problemStatement: team.project.problemStatement,
                pptUrl: team.project.pptUrl,
                latestSubmission: team.project.submissions[0] ? {
                    attemptNo: team.project.submissions[0].attemptNo,
                    status: team.project.submissions[0].status,
                    plagiarismScore: team.project.submissions[0].plagiarismReport?.similarityPct,
                    plagiarismStatus: team.project.submissions[0].plagiarismReport?.status,
                    submittedAt: team.project.submissions[0].createdAt
                } : null
            } : null,
            createdAt: team.createdAt
        }))

        return NextResponse.json({
            success: true,
            data: exportData,
            exportedAt: new Date().toISOString(),
            totalTeams: exportData.length
        })

    } catch (error) {
        console.error("Error exporting data:", error)
        return NextResponse.json(
            { error: "Failed to export data" },
            { status: 500 }
        )
    }
}
