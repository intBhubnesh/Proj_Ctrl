"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: UserRole | UserRole[]
    requireOnboarding?: boolean
    requireVerifiedTeam?: boolean
    fallbackUrl?: string
    loadingComponent?: ReactNode
}

/**
 * Client-side route protection component
 * Redirects to login if not authenticated or to appropriate page if not authorized
 */
export function ProtectedRoute({
    children,
    allowedRoles,
    requireOnboarding = false,
    requireVerifiedTeam = false,
    fallbackUrl = '/auth/login',
    loadingComponent
}: ProtectedRouteProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return

        // Not authenticated - redirect to login
        if (status === 'unauthenticated' || !session) {
            console.warn('🔒 Not authenticated. Redirecting to login...')
            const currentPath = window.location.pathname + window.location.search
            sessionStorage.setItem('redirectAfterLogin', currentPath)
            router.push('/auth/login?error=SessionExpired')
            return
        }

        const user = session.user as any

        // Check role-based access
        if (allowedRoles) {
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
            if (!user.role || !roles.includes(user.role)) {
                console.warn('⛔ Access denied. Insufficient permissions.')
                router.push('/unauthorized')
                return
            }
        }

        // Check onboarding completion
        if (requireOnboarding && !user.hasCompletedOnboarding) {
            console.warn('⚠️ Onboarding not completed.')
            
            // Redirect to appropriate onboarding page
            if (user.role === 'STUDENT') {
                router.push('/onboarding/student')
            } else if (user.role === 'TEACHER') {
                router.push('/onboarding/teacher')
            } else {
                router.push('/onboarding/role-selection')
            }
            return
        }

        // Check team verification (for students)
        if (requireVerifiedTeam && user.role === 'STUDENT') {
            if (!user.teamId) {
                console.warn('⚠️ No team assigned.')
                router.push('/student/team-setup')
                return
            }

            if (!user.isTeamVerified) {
                console.warn('⚠️ Team not verified.')
                router.push('/student/team')
                return
            }
        }
    }, [session, status, router, allowedRoles, requireOnboarding, requireVerifiedTeam])

    // Show loading state
    if (status === 'loading') {
        return loadingComponent || (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    // Not authenticated
    if (status === 'unauthenticated' || !session) {
        return null // Will redirect in useEffect
    }

    const user = session.user as any

    // Check authorization
    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
        if (!user.role || !roles.includes(user.role)) {
            return null // Will redirect in useEffect
        }
    }

    // Check onboarding
    if (requireOnboarding && !user.hasCompletedOnboarding) {
        return null // Will redirect in useEffect
    }

    // Check team verification
    if (requireVerifiedTeam && user.role === 'STUDENT') {
        if (!user.teamId || !user.isTeamVerified) {
            return null // Will redirect in useEffect
        }
    }

    // All checks passed - render children
    return <>{children}</>
}

/**
 * Higher-order component for protecting pages
 */
export function withProtectedRoute<P extends object>(
    Component: React.ComponentType<P>,
    options: Omit<ProtectedRouteProps, 'children'>
) {
    return function ProtectedComponent(props: P) {
        return (
            <ProtectedRoute {...options}>
                <Component {...props} />
            </ProtectedRoute>
        )
    }
}

