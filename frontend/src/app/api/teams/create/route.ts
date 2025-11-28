import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// Generate unique team code
function generateTeamCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'TEAM-'
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

export async function POST(req: NextRequest) {
    try {
        console.log('🔵 Team Create API - Request received')
        const session = await getServerSession(authOptions)
        console.log('🔐 Session:', session?.user?.email, 'Role:', session?.user?.role)

        if (!session || !session.user) {
            console.log('❌ No session found')
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Verify user is a student
        if (session.user.role !== 'STUDENT') {
            console.log('❌ User is not a student:', session.user.role)
            return NextResponse.json(
                { error: "Only students can create teams" },
                { status: 403 }
            )
        }

        const { name } = await req.json()
        console.log('📦 Team name:', name)

        if (!name || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Team name is required" },
                { status: 400 }
            )
        }

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: { currentTeam: true }
        })
        console.log('👤 Student profile found:', studentProfile?.id, 'Department:', studentProfile?.department)

        if (!studentProfile) {
            console.log('❌ Student profile not found')
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            )
        }

        // Check if student is already in a team
        if (studentProfile.currentTeamId) {
            console.log('❌ Student already in team:', studentProfile.currentTeamId)
            return NextResponse.json(
                { error: "You are already part of a team. Leave your current team first." },
                { status: 400 }
            )
        }

        // Generate unique team code
        let teamCode = generateTeamCode()
        let codeExists = await prisma.team.findUnique({ where: { code: teamCode } })

        // Regenerate if code already exists
        while (codeExists) {
            teamCode = generateTeamCode()
            codeExists = await prisma.team.findUnique({ where: { code: teamCode } })
        }
        console.log('🔑 Generated team code:', teamCode)

        // Create team with transaction
        console.log('💾 Creating team in database...')
        const result = await prisma.$transaction(async (tx) => {
            // Create team
            const team = await tx.team.create({
                data: {
                    name: name.trim(),
                    code: teamCode,
                    leaderUserId: session.user.id,
                    department: studentProfile.department,
                }
            })
            console.log('✅ Team created:', team.id, team.name)

            // Create team membership for leader
            const membership = await tx.teamMembership.create({
                data: {
                    teamId: team.id,
                    studentProfileId: studentProfile.id,
                    role: 'LEADER',
                }
            })
            console.log('✅ Membership created:', membership.id)

            // Update student profile to set current team
            await tx.studentProfile.update({
                where: { id: studentProfile.id },
                data: { currentTeamId: team.id }
            })
            console.log('✅ Student profile updated with team ID')

            return { team, membership }
        })

        console.log('🎉 Team creation successful!')
        return NextResponse.json({
            success: true,
            team: {
                id: result.team.id,
                name: result.team.name,
                code: result.team.code,
                department: result.team.department,
                createdAt: result.team.createdAt,
            }
        })

    } catch (error: any) {
        console.error("Error creating team:", error)

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Team code conflict. Please try again." },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to create team" },
            { status: 500 }
        )
    }
}
