# Authentication & Route Protection Guide

This guide explains how to implement authentication and route protection in the application.

## Overview

The application uses **NextAuth.js** with JWT strategy for authentication. We have implemented comprehensive protection at both the **backend (API routes)** and **frontend (pages/components)** levels.

---

## Backend API Route Protection

### Using Auth Helpers

All API routes should use the authentication helpers from `@/lib/auth-helpers.ts` instead of manually checking sessions.

### Available Helper Functions

#### 1. `requireAuth()` - Basic Authentication
Ensures the user is logged in.

```typescript
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const { session, error } = await requireAuth()
    if (error) return error
    
    // User is authenticated, proceed with logic
    const userId = session.user.id
    // ...
}
```

#### 2. `requireRole(role)` - Role-Based Access
Ensures the user has a specific role.

```typescript
import { requireRole } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const { session, error } = await requireRole('ADMIN')
    if (error) return error
    
    // User is an admin, proceed
}
```

#### 3. `requireStudent()` - Student-Only Access
Shorthand for requiring STUDENT role.

```typescript
import { requireStudent } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const { session, error } = await requireStudent()
    if (error) return error
    
    // User is a student
}
```

#### 4. `requireTeacher()` - Teacher-Only Access
```typescript
import { requireTeacher } from '@/lib/auth-helpers'
```

#### 5. `requireAdmin()` - Admin-Only Access
```typescript
import { requireAdmin } from '@/lib/auth-helpers'
```

#### 6. `requireAnyRole([roles])` - Multiple Roles
Allows access if user has any of the specified roles.

```typescript
import { requireAnyRole } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
    const { session, error } = await requireAnyRole(['TEACHER', 'ADMIN'])
    if (error) return error
    
    // User is either a teacher or admin
}
```

#### 7. `requireOnboarding()` - Onboarding Check
Ensures user has completed onboarding.

```typescript
import { requireOnboarding } from '@/lib/auth-helpers'
```

#### 8. `requireVerifiedTeam()` - Team Verification Check
For students, ensures they have a verified team.

```typescript
import { requireVerifiedTeam } from '@/lib/auth-helpers'
```

### Error Responses

The helpers automatically return appropriate HTTP status codes:
- **401 Unauthorized** - Not logged in or session expired
- **403 Forbidden** - Logged in but insufficient permissions

---

## Frontend Client-Side Protection

### Using authFetch for API Calls

Replace all `fetch()` calls with `authFetch()` from `@/lib/api-client.ts`. This automatically handles 401 errors and redirects to login.

```typescript
import { authFetch, authPost, authPatch, authDelete } from '@/lib/api-client'

// GET request
const response = await authFetch('/api/student/dashboard')

// POST request
const response = await authPost('/api/teams/create', { name: 'Team A' })

// PATCH request
const response = await authPatch('/api/project/update', { repoUrl: 'https://...' })

// DELETE request
const response = await authDelete('/api/weekly-reports/123')
```

### Benefits of authFetch

1. **Automatic 401 Handling** - Redirects to login when session expires
2. **Preserves Current Path** - Stores current URL to redirect back after login
3. **Error Logging** - Logs authentication errors to console
4. **Consistent Behavior** - All API calls handle auth the same way

### Using ProtectedRoute Component

Wrap pages or components that require authentication:

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function StudentDashboard() {
    return (
        <ProtectedRoute 
            allowedRoles="STUDENT"
            requireOnboarding={true}
            requireVerifiedTeam={true}
        >
            {/* Your page content */}
        </ProtectedRoute>
    )
}
```

### ProtectedRoute Props

- `allowedRoles` - Single role or array of roles (e.g., `'STUDENT'` or `['TEACHER', 'ADMIN']`)
- `requireOnboarding` - Ensure user completed onboarding (default: false)
- `requireVerifiedTeam` - For students, ensure team is verified (default: false)
- `fallbackUrl` - Where to redirect if unauthorized (default: '/auth/login')
- `loadingComponent` - Custom loading component (optional)

---

## Session Expiry Flow

1. User's session expires (after 30 days of inactivity)
2. User makes an API request using `authFetch()`
3. Backend returns **401 Unauthorized**
4. `authFetch()` detects 401 and:
   - Stores current URL in sessionStorage
   - Redirects to `/auth/login?error=SessionExpired`
5. User logs in again
6. `handlePostLoginRedirect()` redirects back to stored URL

---

## Best Practices

### ✅ DO

- Use `authFetch()` for all API calls in client components
- Use auth helpers (`requireAuth`, `requireRole`, etc.) in API routes
- Wrap protected pages with `<ProtectedRoute>`
- Check user role/permissions on both frontend AND backend

### ❌ DON'T

- Don't use plain `fetch()` for authenticated API calls
- Don't manually check `session?.user?.id` in API routes
- Don't rely only on frontend protection (always protect backend too)
- Don't forget to handle loading states

---

## Example: Complete Protected Page

```typescript
"use client"

import { ProtectedRoute } from '@/components/auth/protected-route'
import { authFetch } from '@/lib/api-client'
import { useEffect, useState } from 'react'

export default function StudentDashboard() {
    const [data, setData] = useState(null)

    useEffect(() => {
        async function fetchData() {
            const response = await authFetch('/api/student/dashboard')
            const json = await response.json()
            setData(json)
        }
        fetchData()
    }, [])

    return (
        <ProtectedRoute allowedRoles="STUDENT" requireOnboarding={true}>
            <div>
                {/* Your dashboard content */}
            </div>
        </ProtectedRoute>
    )
}
```

---

## Testing Authentication

1. **Test session expiry**: Clear cookies and try accessing protected routes
2. **Test role access**: Try accessing admin routes as a student
3. **Test redirect flow**: Logout, access protected page, login, verify redirect back
4. **Test API protection**: Call protected API endpoints without auth headers

---

## Troubleshooting

**Issue**: Getting redirected to login repeatedly
- Check if session is being properly set after login
- Verify NEXTAUTH_SECRET is set in environment variables

**Issue**: 401 errors not redirecting to login
- Ensure you're using `authFetch()` instead of plain `fetch()`
- Check browser console for error messages

**Issue**: User can access pages they shouldn't
- Verify backend API routes use auth helpers
- Check middleware configuration in `middleware.ts`

