import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { repoUrl, technology, domain, problemStatement, pptUrl } = body

        // Get student profile and verify they are a team leader
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                currentTeam: {
                    include: {
                        memberships: {
                            where: {
                                studentProfile: {
                                    userId: session.user.id
                                }
                            }
                        },
                        project: true
                    }
                }
            }
        })

        if (!studentProfile?.currentTeam) {
            return NextResponse.json(
                { error: 'You are not part of a team' },
                { status: 400 }
            )
        }

        const team = studentProfile.currentTeam
        const membership = team.memberships[0]

        // Check if user is the leader
        if (membership?.role !== 'LEADER') {
            return NextResponse.json(
                { error: 'Only team leaders can update project details' },
                { status: 403 }
            )
        }

        // Update or create project
        let project = team.project

        if (!project) {
            // Create new project
            project = await prisma.project.create({
                data: {
                    teamId: team.id,
                    technology: technology || 'Pending',
                    domain: domain || 'Pending',
                    problemStatement: problemStatement || 'Pending',
                    repoUrl: repoUrl || null,
                    pptUrl: pptUrl || null
                }
            })
        } else {
            // Update existing project
            const updateData: any = {}
            
            if (repoUrl !== undefined) updateData.repoUrl = repoUrl
            if (technology !== undefined) updateData.technology = technology
            if (domain !== undefined) updateData.domain = domain
            if (problemStatement !== undefined) updateData.problemStatement = problemStatement
            if (pptUrl !== undefined) updateData.pptUrl = pptUrl

            project = await prisma.project.update({
                where: { id: project.id },
                data: updateData
            })
        }

        return NextResponse.json({
            success: true,
            project: {
                id: project.id,
                technology: project.technology,
                domain: project.domain,
                problemStatement: project.problemStatement,
                repoUrl: project.repoUrl,
                pptUrl: project.pptUrl
            }
        })

    } catch (error) {
        console.error('❌ Project update error:', error)
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        )
    }
}

