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

        // Verify user is a teacher
        if (session.user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: "Only teachers can create teacher profiles" },
                { status: 403 }
            )
        }

        const { expertise, technologies, department } = await req.json()

        // Check if profile already exists
        const existingProfile = await prisma.teacherProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (existingProfile) {
            return NextResponse.json(
                { error: "Teacher profile already exists" },
                { status: 400 }
            )
        }

        // Create teacher profile
        const profile = await prisma.teacherProfile.create({
            data: {
                userId: session.user.id,
                expertise,
                technologies,
                department,
            }
        })

        return NextResponse.json({
            success: true,
            profile
        })
    } catch (error) {
        console.error("Error creating teacher profile:", error)
        return NextResponse.json(
            { error: "Failed to create teacher profile" },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const profile = await prisma.teacherProfile.findUnique({
            where: { userId: session.user.id }
        })

        return NextResponse.json({ profile })
    } catch (error) {
        console.error("Error fetching teacher profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}
