import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

/**
 * Get authenticated session or return 401 error response
 * @returns Session object or NextResponse with 401 error
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.id) {
        return {
            session: null,
            error: NextResponse.json(
                { error: 'Unauthorized. Please log in to continue.' },
                { status: 401 }
            )
        }
    }

    return { session, error: null }
}

/**
 * Require specific role(s) for API access
 * @param allowedRoles - Array of allowed roles or single role
 * @returns Session object or NextResponse with 401/403 error
 */
export async function requireRole(allowedRoles: UserRole | UserRole[]) {
    const { session, error } = await requireAuth()

    if (error) {
        return { session: null, error }
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    const userRole = session!.user.role

    if (!userRole || !roles.includes(userRole as UserRole)) {
        return {
            session: null,
            error: NextResponse.json(
                { 
                    error: 'Forbidden. You do not have permission to access this resource.',
                    requiredRole: roles.length === 1 ? roles[0] : roles
                },
                { status: 403 }
            )
        }
    }

    return { session, error: null }
}

/**
 * Require student role and return student profile
 * @returns Session and student profile or error response
 */
export async function requireStudent() {
    const { session, error } = await requireRole('STUDENT')

    if (error) {
        return { session: null, studentProfile: null, error }
    }

    return { session, error: null }
}

/**
 * Require teacher role
 * @returns Session or error response
 */
export async function requireTeacher() {
    return requireRole('TEACHER')
}

/**
 * Require admin role
 * @returns Session or error response
 */
export async function requireAdmin() {
    return requireRole('ADMIN')
}

/**
 * Require any of the specified roles
 * @param roles - Array of allowed roles
 * @returns Session or error response
 */
export async function requireAnyRole(roles: UserRole[]) {
    return requireRole(roles)
}

/**
 * Check if user has completed onboarding
 * @returns Session or error response
 */
export async function requireOnboarding() {
    const { session, error } = await requireAuth()

    if (error) {
        return { session: null, error }
    }

    const hasCompletedOnboarding = (session!.user as any).hasCompletedOnboarding

    if (!hasCompletedOnboarding) {
        return {
            session: null,
            error: NextResponse.json(
                { error: 'Please complete onboarding first.' },
                { status: 403 }
            )
        }
    }

    return { session, error: null }
}

/**
 * Check if student has a verified team
 * @returns Session or error response
 */
export async function requireVerifiedTeam() {
    const { session, error } = await requireStudent()

    if (error) {
        return { session: null, error }
    }

    const teamId = (session!.user as any).teamId
    const isTeamVerified = (session!.user as any).isTeamVerified

    if (!teamId) {
        return {
            session: null,
            error: NextResponse.json(
                { error: 'You must be part of a team to access this resource.' },
                { status: 403 }
            )
        }
    }

    if (!isTeamVerified) {
        return {
            session: null,
            error: NextResponse.json(
                { error: 'Your team must be verified to access this resource.' },
                { status: 403 }
            )
        }
    }

    return { session, error: null }
}

