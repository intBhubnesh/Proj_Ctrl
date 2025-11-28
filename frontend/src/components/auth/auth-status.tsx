"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AuthStatus() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: true 
    })
  }

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <Button 
        variant="outline" 
        onClick={() => router.push('/auth/login')}
      >
        Sign In
      </Button>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {session.user?.image && (
          <img 
            src={session.user.image} 
            alt={session.user.name || 'User'} 
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="text-sm">
          <p className="font-medium">{session.user?.name}</p>
          <p className="text-gray-600">{session.user?.email}</p>
        </div>
      </div>
      <Button variant="outline" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
