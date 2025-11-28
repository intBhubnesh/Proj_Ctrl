import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { password, confirmPassword } = body

        if (!password || !confirmPassword) {
            return NextResponse.json({ 
                error: "Password and confirmation are required" 
            }, { status: 400 })
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ 
                error: "Passwords do not match" 
            }, { status: 400 })
        }

        if (password.length < 8) {
            return NextResponse.json({ 
                error: "Password must be at least 8 characters long" 
            }, { status: 400 })
        }

        // Check if user already has a password
        const users = await prisma.$queryRaw<Array<{
            id: string
            password: string | null
        }>>`
            SELECT id, password
            FROM "User"
            WHERE id = ${session.user.id}
            LIMIT 1
        `

        if (!users || users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const user = users[0]

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user password
        await prisma.$executeRaw`
            UPDATE "User"
            SET password = ${hashedPassword}
            WHERE id = ${session.user.id}
        `

        const message = user.password 
            ? "Password updated successfully" 
            : "Password set successfully. You can now login with email and password."

        return NextResponse.json({
            success: true,
            message
        })
    } catch (error) {
        console.error("Error setting password:", error)
        return NextResponse.json(
            { error: "Failed to set password" },
            { status: 500 }
        )
    }
}

