import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { notificationId } = body

        if (!notificationId) {
            return NextResponse.json(
                { error: 'Notification ID is required' },
                { status: 400 }
            )
        }

        // Mark notification as read
        await prisma.userNotification.updateMany({
            where: {
                userId: session.user.id,
                notificationId: notificationId,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('❌ Mark notification read error:', error)
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        )
    }
}

// Mark all notifications as read
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await prisma.userNotification.updateMany({
            where: {
                userId: session.user.id,
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('❌ Mark all notifications read error:', error)
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        )
    }
}

