/**
 * Enhanced fetch wrapper with automatic 401 handling and session expiry detection
 * Automatically redirects to login page when session expires or user is unauthorized
 */

interface FetchOptions extends RequestInit {
    skipAuthRedirect?: boolean // Skip automatic redirect on 401
}

/**
 * Custom fetch wrapper that handles authentication errors
 * @param url - The URL to fetch
 * @param options - Fetch options with optional skipAuthRedirect flag
 * @returns Response object
 */
export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const { skipAuthRedirect = false, ...fetchOptions } = options

    try {
        const response = await fetch(url, fetchOptions)

        // Handle 401 Unauthorized - session expired or not authenticated
        if (response.status === 401 && !skipAuthRedirect) {
            console.warn('🔒 Session expired or unauthorized. Redirecting to login...')
            
            // Store the current URL to redirect back after login
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname + window.location.search
                sessionStorage.setItem('redirectAfterLogin', currentPath)
                
                // Redirect to login page
                window.location.href = '/auth/login?error=SessionExpired'
            }
            
            throw new Error('Unauthorized - Session expired')
        }

        // Handle 403 Forbidden - authenticated but not authorized
        if (response.status === 403) {
            console.warn('⛔ Access forbidden. Insufficient permissions.')
        }

        return response
    } catch (error) {
        // Re-throw the error for the caller to handle
        throw error
    }
}

/**
 * Wrapper for GET requests with auth handling
 */
export async function authGet(url: string, options: FetchOptions = {}) {
    return authFetch(url, { ...options, method: 'GET' })
}

/**
 * Wrapper for POST requests with auth handling
 */
export async function authPost(url: string, body?: any, options: FetchOptions = {}) {
    return authFetch(url, {
        ...options,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    })
}

/**
 * Wrapper for PUT requests with auth handling
 */
export async function authPut(url: string, body?: any, options: FetchOptions = {}) {
    return authFetch(url, {
        ...options,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    })
}

/**
 * Wrapper for PATCH requests with auth handling
 */
export async function authPatch(url: string, body?: any, options: FetchOptions = {}) {
    return authFetch(url, {
        ...options,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    })
}

/**
 * Wrapper for DELETE requests with auth handling
 */
export async function authDelete(url: string, options: FetchOptions = {}) {
    return authFetch(url, { ...options, method: 'DELETE' })
}

/**
 * Check if user is authenticated by calling a protected endpoint
 * @returns true if authenticated, false otherwise
 */
export async function checkAuth(): Promise<boolean> {
    try {
        const response = await authFetch('/api/user/profile', { skipAuthRedirect: true })
        return response.ok
    } catch {
        return false
    }
}

/**
 * Handle redirect after successful login
 * Redirects to the stored path or default dashboard based on role
 */
export function handlePostLoginRedirect(userRole?: string) {
    if (typeof window === 'undefined') return

    // Check for stored redirect path
    const redirectPath = sessionStorage.getItem('redirectAfterLogin')
    
    if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        window.location.href = redirectPath
        return
    }

    // Default redirect based on role
    if (userRole === 'STUDENT') {
        window.location.href = '/student/dashboard'
    } else if (userRole === 'TEACHER') {
        window.location.href = '/teacher/dashboard'
    } else if (userRole === 'ADMIN') {
        window.location.href = '/admin/dashboard'
    } else {
        window.location.href = '/'
    }
}

