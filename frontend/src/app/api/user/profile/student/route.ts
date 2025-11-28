import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        console.log('📝 Student Profile API - POST request received')

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
                { error: "Only students can create student profiles" },
                { status: 403 }
            )
        }

        const body = await req.json()
        console.log('📦 Request body:', body)

        const { enrollmentNo, department, semester, division, institution, course } = body

        // Validate required fields
        if (!enrollmentNo || !department) {
            console.log('❌ Missing required fields')
            return NextResponse.json(
                { error: "Enrollment number and department are required" },
                { status: 400 }
            )
        }

        // Check if profile already exists
        const existingProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (existingProfile) {
            console.log('❌ Profile already exists for user:', session.user.id)
            return NextResponse.json(
                { error: "Student profile already exists" },
                { status: 400 }
            )
        }

        console.log('✅ Creating student profile...')

        // Create student profile and update user enrollment number
        const [profile, user] = await prisma.$transaction([
            prisma.studentProfile.create({
                data: {
                    userId: session.user.id,
                    department,
                    semester: semester ? parseInt(semester) : null,
                    division,
                    institution,
                    course,
                }
            }),
            prisma.user.update({
                where: { id: session.user.id },
                data: { enrollmentNo }
            })
        ])

        console.log('✅ Student profile created successfully:', profile.id)

        return NextResponse.json({
            success: true,
            profile,
            user: {
                id: user.id,
                enrollmentNo: user.enrollmentNo,
            }
        })
    } catch (error: any) {
        console.error("Error creating student profile:", error)

        // Handle unique constraint violations
        if (error.code === 'P2002') {
            return NextResponse.json(
                { error: "Enrollment number already exists" },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Failed to create student profile" },
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

        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                currentTeam: {
                    include: {
                        project: true,
                        memberships: {
                            where: { leftAt: null },
                            include: {
                                studentProfile: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json({ profile })
    } catch (error) {
        console.error("Error fetching student profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}
