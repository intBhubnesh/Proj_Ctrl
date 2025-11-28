import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

// GET - Fetch all weekly reports for the student's team
export async function GET(req: NextRequest) {
    try {
        const { session, error } = await requireStudent()
        if (error) return error

        // Get student profile and team membership
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                teamMemberships: {
                    where: { leftAt: null },
                    include: {
                        team: {
                            include: {
                                weeklyReports: {
                                    include: {
                                        author: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                            }
                                        }
                                    },
                                    orderBy: {
                                        createdAt: 'desc'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!studentProfile || studentProfile.teamMemberships.length === 0) {
            return NextResponse.json({ error: 'No team found' }, { status: 404 })
        }

        const team = studentProfile.teamMemberships[0].team
        const weeklyReports = team.weeklyReports

        return NextResponse.json({
            teamId: team.id,
            teamName: team.name,
            weeklyReports
        })
    } catch (error) {
        console.error('Error fetching weekly reports:', error)
        return NextResponse.json(
            { error: 'Failed to fetch weekly reports' },
            { status: 500 }
        )
    }
}

// POST - Submit a new weekly report
export async function POST(req: NextRequest) {
    try {
        const { session, error } = await requireStudent()
        if (error) return error

        const body = await req.json()
        const { weekLabel, content, imageUrls } = body

        if (!weekLabel || !content) {
            return NextResponse.json(
                { error: 'Week label and content are required' },
                { status: 400 }
            )
        }

        // Validate content length (200 words max)
        const wordCount = content.trim().split(/\s+/).length
        if (wordCount > 200) {
            return NextResponse.json(
                { error: 'Content must be 200 words or less' },
                { status: 400 }
            )
        }

        // Validate image URLs (1-3 images)
        if (imageUrls && (imageUrls.length < 1 || imageUrls.length > 3)) {
            return NextResponse.json(
                { error: 'Must provide 1-3 image URLs' },
                { status: 400 }
            )
        }

        // Get student's team
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                teamMemberships: {
                    where: { leftAt: null },
                    select: { teamId: true }
                }
            }
        })

        if (!studentProfile || studentProfile.teamMemberships.length === 0) {
            return NextResponse.json({ error: 'No team found' }, { status: 404 })
        }

        const teamId = studentProfile.teamMemberships[0].teamId

        // Create weekly report
        const weeklyReport = await prisma.weeklyReport.create({
            data: {
                teamId,
                authorUserId: session.user.id,
                weekLabel,
                content,
                imageUrls: imageUrls || []
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(weeklyReport, { status: 201 })
    } catch (error: any) {
        console.error('Error creating weekly report:', error)
        
        // Handle unique constraint violation (duplicate week)
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: 'A report for this week already exists' },
                { status: 409 }
            )
        }

        return NextResponse.json(
            { error: 'Failed to create weekly report' },
            { status: 500 }
        )
    }
}

