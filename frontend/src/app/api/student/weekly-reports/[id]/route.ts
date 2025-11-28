import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

// GET - Fetch a specific weekly report
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { session, error } = await requireStudent()
        if (error) return error

        const weeklyReport = await prisma.weeklyReport.findUnique({
            where: { id: params.id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })

        if (!weeklyReport) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }

        // Verify user is part of the team
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                teamMemberships: {
                    where: {
                        teamId: weeklyReport.teamId,
                        leftAt: null
                    }
                }
            }
        })

        if (!studentProfile || studentProfile.teamMemberships.length === 0) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        return NextResponse.json(weeklyReport)
    } catch (error) {
        console.error('Error fetching weekly report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch weekly report' },
            { status: 500 }
        )
    }
}

// DELETE - Delete a weekly report (only author can delete)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { session, error } = await requireStudent()
        if (error) return error

        const weeklyReport = await prisma.weeklyReport.findUnique({
            where: { id: params.id }
        })

        if (!weeklyReport) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }

        // Only the author can delete
        if (weeklyReport.authorUserId !== session.user.id) {
            return NextResponse.json(
                { error: 'Only the author can delete this report' },
                { status: 403 }
            )
        }

        await prisma.weeklyReport.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Report deleted successfully' })
    } catch (error) {
        console.error('Error deleting weekly report:', error)
        return NextResponse.json(
            { error: 'Failed to delete weekly report' },
            { status: 500 }
        )
    }
}

