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
                { error: "Only students can join teams" },
                { status: 403 }
            )
        }

        const { code } = await req.json()

        if (!code || code.trim().length === 0) {
            return NextResponse.json(
                { error: "Team code is required" },
                { status: 400 }
            )
        }

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: { currentTeam: true }
        })

        if (!studentProfile) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            )
        }

        // Check if student is already in a team
        if (studentProfile.currentTeamId) {
            return NextResponse.json({
                error: "You are already part of a team. Leave your current team first.",
                type: "ALREADY_IN_TEAM"
            }, { status: 400 })
        }

        // Find team by code
        const team = await prisma.team.findUnique({
            where: { code: code.trim().toUpperCase() },
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
        })

        if (!team) {
            return NextResponse.json(
                { error: "Invalid team code. Please check and try again." },
                { status: 404 }
            )
        }

        // Check team capacity (max 4 members)
        const currentMemberCount = team.memberships.length
        if (currentMemberCount >= 4) {
            return NextResponse.json({
                error: "This team is full. Maximum 4 members allowed.",
                type: "TEAM_FULL",
                currentMembers: currentMemberCount,
                maxMembers: 4
            }, { status: 400 })
        }

        // Check department matching
        if (studentProfile.department !== team.department) {
            return NextResponse.json({
                error: `Department mismatch. This team is for ${team.department} students only.`,
                type: "DEPARTMENT_MISMATCH",
                teamDepartment: team.department,
                yourDepartment: studentProfile.department
            }, { status: 400 })
        }

        // Join team with transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create team membership
            const membership = await tx.teamMembership.create({
                data: {
                    teamId: team.id,
                    studentProfileId: studentProfile.id,
                    role: 'MEMBER',
                }
            })

            // Update student profile to set current team
            await tx.studentProfile.update({
                where: { id: studentProfile.id },
                data: { currentTeamId: team.id }
            })

            return { membership }
        })

        return NextResponse.json({
            success: true,
            team: {
                id: team.id,
                name: team.name,
                code: team.code,
                department: team.department,
                memberCount: currentMemberCount + 1,
            }
        })

    } catch (error: any) {
        console.error("Error joining team:", error)

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "You are already a member of this team." },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to join team" },
            { status: 500 }
        )
    }
}
