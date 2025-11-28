import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userRole = (session.user as any).role
        if (userRole !== 'STUDENT') {
            return NextResponse.json({ error: "Only students can leave teams" }, { status: 403 })
        }

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                currentTeam: {
                    include: {
                        memberships: true
                    }
                }
            }
        })

        if (!studentProfile || !studentProfile.currentTeam) {
            return NextResponse.json({ error: "You are not part of any team" }, { status: 400 })
        }

        const team = studentProfile.currentTeam

        // Check if team is already validated
        if (team.isValidated) {
            return NextResponse.json({ error: "Cannot leave a validated team" }, { status: 400 })
        }

        // Check if user is the team leader
        if (team.leaderUserId === session.user.id) {
            // If leader is leaving and there are other members, transfer leadership
            const otherMembers = team.memberships.filter(m => m.studentProfileId !== studentProfile.id)

            if (otherMembers.length > 0) {
                // Transfer leadership to the first member
                const newLeader = otherMembers[0]

                // Get the new leader's student profile to get their userId
                const newLeaderProfile = await prisma.studentProfile.findUnique({
                    where: { id: newLeader.studentProfileId }
                })

                if (!newLeaderProfile) {
                    return NextResponse.json({ error: "New leader profile not found" }, { status: 500 })
                }

                await prisma.$transaction(async (tx) => {
                    // Update team leader
                    await tx.team.update({
                        where: { id: team.id },
                        data: { leaderUserId: newLeaderProfile.userId }
                    })

                    // Update new leader's membership role
                    await tx.teamMembership.update({
                        where: { id: newLeader.id },
                        data: { role: 'LEADER' }
                    })

                    // Remove current user's membership
                    await tx.teamMembership.deleteMany({
                        where: {
                            teamId: team.id,
                            studentProfileId: studentProfile.id
                        }
                    })

                    // Update student profile
                    await tx.studentProfile.update({
                        where: { id: studentProfile.id },
                        data: { currentTeamId: null }
                    })
                })
            } else {
                // If leader is the only member, delete the team
                await prisma.$transaction(async (tx) => {
                    // Delete memberships
                    await tx.teamMembership.deleteMany({
                        where: { teamId: team.id }
                    })

                    // Delete team
                    await tx.team.delete({
                        where: { id: team.id }
                    })

                    // Update student profile
                    await tx.studentProfile.update({
                        where: { id: studentProfile.id },
                        data: { currentTeamId: null }
                    })
                })
            }
        } else {
            // Regular member leaving
            await prisma.$transaction(async (tx) => {
                // Remove membership
                await tx.teamMembership.deleteMany({
                    where: {
                        teamId: team.id,
                        studentProfileId: studentProfile.id
                    }
                })

                // Update student profile
                await tx.studentProfile.update({
                    where: { id: studentProfile.id },
                    data: { currentTeamId: null }
                })
            })
        }

        return NextResponse.json({
            success: true,
            message: "Successfully left the team"
        })
    } catch (error) {
        console.error("Error leaving team:", error)
        return NextResponse.json(
            { error: "Failed to leave team" },
            { status: 500 }
        )
    }
}
