import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Adapter } from "next-auth/adapters"

export const authOptions: NextAuthOptions = {
    // Use adapter only for Google OAuth, not for credentials
    adapter: PrismaAdapter(prisma) as Adapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required")
                }

                // Find user by email using raw query to get password field
                const users = await prisma.$queryRaw<Array<{
                    id: string
                    email: string
                    name: string | null
                    image: string | null
                    role: string
                    enrollmentNo: string | null
                    password: string | null
                }>>`
                    SELECT id, email, name, image, role, "enrollmentNo", password
                    FROM "User"
                    WHERE email = ${credentials.email}
                    LIMIT 1
                `

                // Check if user exists
                if (!users || users.length === 0) {
                    throw new Error("No account found with this email")
                }

                const user = users[0]

                // Check if user has a password (not a Google OAuth user)
                if (!user.password) {
                    throw new Error("This account uses Google Sign-In. Please use the 'Login with Google' button")
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                if (!isPasswordValid) {
                    throw new Error("Invalid password")
                }

                // Return user object
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role as any,
                    enrollmentNo: user.enrollmentNo,
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            console.log('🔐 SignIn Callback:', {
                provider: account?.provider,
                email: user.email,
                userId: user.id
            })

            if (account?.provider === "google") {
                try {
                    // Check if user exists in database
                    let dbUser = await prisma.user.findUnique({
                        where: { email: user.email! }
                    })

                    // If user doesn't exist, the adapter will create it
                    // But we need to ensure it has the right default role
                    if (!dbUser) {
                        console.log('✨ New Google user, will be created by adapter')
                        // The adapter will create the user, we just allow the sign in
                        return true
                    } else {
                        console.log('✅ Existing user found:', dbUser.email)
                        return true
                    }
                } catch (error) {
                    console.error('❌ Error in Google signIn callback:', error)
                    return false
                }
            }

            if (account?.provider === "credentials") {
                // Credentials login already validated in authorize
                console.log('✅ Credentials login validated')
                return true
            }

            return false
        },
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.enrollmentNo = (user as any).enrollmentNo
            }

            // Fetch fresh user data on each request to keep session updated
            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    include: {
                        studentProfile: {
                            include: {
                                currentTeam: {
                                    select: {
                                        id: true,
                                        isVerified: true,
                                        isValidated: true,
                                    }
                                }
                            }
                        },
                        teacherProfile: true,
                        adminProfile: true,
                    }
                })

                if (dbUser) {
                    token.role = dbUser.role
                    token.enrollmentNo = dbUser.enrollmentNo

                    // Check if user has completed onboarding
                    const hasProfile = dbUser.role === 'STUDENT'
                        ? !!dbUser.studentProfile
                        : dbUser.role === 'TEACHER'
                            ? !!dbUser.teacherProfile
                            : dbUser.role === 'ADMIN'
                                ? !!dbUser.adminProfile
                                : false

                    token.hasCompletedOnboarding = hasProfile

                    // For students, check if they have a validated team
                    if (dbUser.role === 'STUDENT' && dbUser.studentProfile) {
                        token.teamId = dbUser.studentProfile.currentTeam?.id || null
                        token.isTeamVerified = dbUser.studentProfile.currentTeam?.isVerified || false
                        token.isTeamValidated = dbUser.studentProfile.currentTeam?.isValidated || false
                    }
                }
            }

            return token
        },
        async session({ session, token, user }) {
            // Add user data to session from token (for JWT) or user (for database sessions)
            if (token) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).enrollmentNo = token.enrollmentNo;
                (session.user as any).hasCompletedOnboarding = token.hasCompletedOnboarding;
                (session.user as any).teamId = token.teamId;
                (session.user as any).isTeamVerified = token.isTeamVerified;
                (session.user as any).isTeamValidated = token.isTeamValidated;
            } else if (user) {
                // Database session strategy
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        studentProfile: {
                            include: {
                                currentTeam: true
                            }
                        },
                        teacherProfile: true,
                        adminProfile: true,
                    }
                })

                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                    (session.user as any).role = dbUser.role;
                    (session.user as any).enrollmentNo = dbUser.enrollmentNo;

                    const hasProfile = dbUser.role === 'STUDENT'
                        ? !!dbUser.studentProfile
                        : dbUser.role === 'TEACHER'
                            ? !!dbUser.teacherProfile
                            : !!dbUser.adminProfile;

                    (session.user as any).hasCompletedOnboarding = hasProfile;

                    if (dbUser.role === 'STUDENT' && dbUser.studentProfile) {
                        (session.user as any).teamId = dbUser.studentProfile.currentTeamId;
                        (session.user as any).isTeamVerified = dbUser.studentProfile.currentTeam?.isVerified || false;
                    }
                }
            }
            return session
        },
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: "jwt", // Changed to JWT for credentials support
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
