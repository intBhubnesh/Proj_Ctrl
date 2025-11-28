import { DefaultSession } from "next-auth"

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role?: UserRole | null
            enrollmentNo?: string | null
            hasCompletedOnboarding: boolean
            teamId?: string | null
            isTeamVerified?: boolean
            isTeamValidated?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        role?: UserRole | null
        enrollmentNo?: string | null
        teamId?: string | null
        isTeamVerified?: boolean
        isTeamValidated?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role?: UserRole | null
        enrollmentNo?: string | null
        hasCompletedOnboarding: boolean
        teamId?: string | null
        isTeamVerified?: boolean
        isTeamValidated?: boolean
    }
}
