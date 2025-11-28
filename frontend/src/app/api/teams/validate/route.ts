import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

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
                { error: "Only students can validate teams" },
                { status: 403 }
            )
        }

        // Get student's current team
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: { currentTeam: true }
        })

        if (!studentProfile || !studentProfile.currentTeamId) {
            return NextResponse.json(
                { error: "You are not part of any team" },
                { status: 400 }
            )
        }

        const teamId = studentProfile.currentTeamId

        // Get all current team members
        const memberships = await prisma.teamMembership.findMany({
            where: {
                teamId: teamId,
                leftAt: null
            },
            include: {
                studentProfile: {
                    include: {
                        user: true,
                        currentTeam: true
                    }
                }
            }
        })

        // Check if any member is in another team
        const conflicts: Array<{
            studentName: string
            studentEmail: string
            enrollmentNo: string | null
            currentTeamId: string | null
            currentTeamName: string | null
        }> = []

        for (const membership of memberships) {
            const student = membership.studentProfile

            // Check if student's currentTeamId matches this team
            if (student.currentTeamId !== teamId) {
                conflicts.push({
                    studentName: student.user.name || 'Unknown',
                    studentEmail: student.user.email || '',
                    enrollmentNo: student.user.enrollmentNo,
                    currentTeamId: student.currentTeamId,
                    currentTeamName: student.currentTeam?.name || null
                })
            }
        }

        // If conflicts found, team is invalid
        if (conflicts.length > 0) {
            return NextResponse.json({
                valid: false,
                canProceed: false,
                conflicts: conflicts,
                message: `${conflicts.length} team member(s) are part of other teams. They must leave their other teams first.`
            }, { status: 400 })
        }

        // Check minimum team size (at least 2 members recommended)
        if (memberships.length < 2) {
            return NextResponse.json({
                valid: true,
                canProceed: true,
                warning: "Your team has only 1 member. Consider adding more members.",
                memberCount: memberships.length
            })
        }

        // All validations passed
        return NextResponse.json({
            valid: true,
            canProceed: true,
            memberCount: memberships.length,
            message: "Team is valid and ready for project submission"
        })

    } catch (error) {
        console.error("Error validating team:", error)
        return NextResponse.json(
            { error: "Failed to validate team" },
            { status: 500 }
        )
    }
}
