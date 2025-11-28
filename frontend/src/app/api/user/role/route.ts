import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const VALID_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { role } = await req.json()

        // Validate role
        if (!VALID_ROLES.includes(role)) {
            return NextResponse.json(
                { error: "Invalid role" },
                { status: 400 }
            )
        }

        // Update user role
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { role },
        })

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            }
        })
    } catch (error) {
        console.error("Error updating user role:", error)
        return NextResponse.json(
            { error: "Failed to update role" },
            { status: 500 }
        )
    }
}
