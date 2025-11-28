import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Define role types as string literals
type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // If user is authenticated
        if (token) {
            const role = token.role as UserRole | undefined
            const hasCompletedOnboarding = token.hasCompletedOnboarding as boolean | undefined
            const hasValidatedTeam = token.hasValidatedTeam as boolean | undefined

            // If user hasn't selected a role yet, redirect to role selection
            if (!role && !path.startsWith('/onboarding/role-selection')) {
                return NextResponse.redirect(new URL('/onboarding/role-selection', req.url))
            }

            // If user has a role but hasn't completed onboarding
            if (role && !hasCompletedOnboarding) {
                // Allow access to onboarding pages
                if (path.startsWith('/onboarding/')) {
                    return NextResponse.next()
                }

                // Redirect to appropriate onboarding page based on role
                if (role === 'STUDENT' && !path.startsWith('/onboarding/student')) {
                    return NextResponse.redirect(new URL('/onboarding/student', req.url))
                }
                if (role === 'TEACHER' && !path.startsWith('/onboarding/teacher')) {
                    return NextResponse.redirect(new URL('/onboarding/teacher', req.url))
                }
                if (role === 'ADMIN') {
                    // Admins don't need onboarding, redirect to dashboard
                    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
                }
            }

            // For students: check team verification status
            if (role === 'STUDENT' && hasCompletedOnboarding) {
                const teamId = token.teamId as string | null | undefined
                const isTeamVerified = token.isTeamVerified as boolean | undefined

                // Allow access to team management pages
                const teamManagementPaths = ['/student/team-setup', '/student/create-team', '/student/join-team', '/student/team']
                const isTeamManagementPath = teamManagementPaths.some(p => path.startsWith(p))

                // Student redirect logic:
                // 1. No team -> must go to team-setup
                // 2. Has team but not verified -> must go to team page
                // 3. Team verified -> can access dashboard

                if (!teamId) {
                    // No team - redirect to team setup if trying to access dashboard or team page
                    if (path.startsWith('/student/dashboard') || path.startsWith('/student/team')) {
                        return NextResponse.redirect(new URL('/student/team-setup', req.url))
                    }
                } else if (!isTeamVerified) {
                    // Has team but not verified - redirect to team page if trying to access dashboard
                    if (path.startsWith('/student/dashboard')) {
                        return NextResponse.redirect(new URL('/student/team', req.url))
                    }
                    // Redirect from team-setup to team page if already in a team
                    if (path.startsWith('/student/team-setup') || path.startsWith('/student/create-team') || path.startsWith('/student/join-team')) {
                        return NextResponse.redirect(new URL('/student/team', req.url))
                    }
                } else {
                    // Team verified - redirect to dashboard if trying to access team management
                    if (isTeamManagementPath) {
                        return NextResponse.redirect(new URL('/student/dashboard', req.url))
                    }
                }
            }

            // If user has completed onboarding, redirect from onboarding pages
            if (hasCompletedOnboarding && path.startsWith('/onboarding/')) {
                if (role === 'STUDENT') {
                    const teamId = token.teamId as string | null | undefined
                    const isTeamVerified = token.isTeamVerified as boolean | undefined

                    // Redirect based on team status
                    if (!teamId) {
                        return NextResponse.redirect(new URL('/student/team-setup', req.url))
                    } else if (!isTeamVerified) {
                        return NextResponse.redirect(new URL('/student/team', req.url))
                    }
                    return NextResponse.redirect(new URL('/student/dashboard', req.url))
                }
                if (role === 'TEACHER') {
                    return NextResponse.redirect(new URL('/teacher/dashboard', req.url))
                }
                if (role === 'ADMIN') {
                    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
                }
            }

            // Role-based access control for protected routes
            if (path.startsWith('/student/') && role !== 'STUDENT') {
                return NextResponse.redirect(new URL('/unauthorized', req.url))
            }
            if (path.startsWith('/teacher/') && role !== 'TEACHER') {
                return NextResponse.redirect(new URL('/unauthorized', req.url))
            }
            if (path.startsWith('/admin/') && role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/unauthorized', req.url))
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname

                // Public paths that don't require authentication
                const publicPaths = ['/', '/auth/login', '/auth/error']
                if (publicPaths.includes(path)) {
                    return true
                }

                // All other paths require authentication
                return !!token
            },
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (ALL API routes - they handle their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
}
