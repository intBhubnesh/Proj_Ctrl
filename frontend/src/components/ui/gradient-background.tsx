"use client"

import { ReactNode } from "react"

interface GradientBackgroundProps {
  children: ReactNode
  className?: string
}

export default function GradientBackground({ children, className = "" }: GradientBackgroundProps) {
  return (
    <div className={`min-h-screen relative overflow-hidden ${className}`}>
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100" />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl translate-x-1/2" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-pink-200/30 to-blue-200/30 rounded-full blur-3xl translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-2xl" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
