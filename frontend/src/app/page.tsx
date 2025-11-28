"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Users, BookOpen, BarChart3, Shield, Zap, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function LandingPage() {
    const router = useRouter()
    const { data: session } = useSession()

    useEffect(() => {
        // If user is already logged in, redirect to appropriate dashboard
        if (session?.user) {
            const user = session.user as any
            if (user.role === 'STUDENT') {
                router.push('/student/dashboard')
            } else if (user.role === 'TEACHER') {
                router.push('/teacher/dashboard')
            } else if (user.role === 'ADMIN') {
                router.push('/admin/dashboard')
            }
        }
    }, [session, router])

    const handleGetStarted = (role: 'student' | 'teacher') => {
        router.push('/auth/login')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">BF</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                BrainFlow
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => router.push('/auth/login')}>
                                Sign In
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={() => handleGetStarted('student')}
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-block mb-4 px-4 py-2 bg-blue-50 rounded-full">
                            <span className="text-blue-600 font-medium text-sm">
                                🎓 Trusted by Educational Institutions
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                            Transform Project Management into{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Smart Collaboration
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                            One unified platform to manage student projects, track progress, detect plagiarism,
                            and provide meaningful assessments—without the chaos.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                onClick={() => handleGetStarted('student')}
                            >
                                <Users className="mr-2 h-5 w-5" />
                                I'm a Student
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="text-lg px-8 py-6 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 transition-all"
                                onClick={() => handleGetStarted('teacher')}
                            >
                                <BookOpen className="mr-2 h-5 w-5" />
                                I'm a Teacher
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>

                        <p className="text-sm text-gray-500">
                            No credit card required • Free for educational use
                        </p>
                    </div>

                    {/* Hero Image/Dashboard Preview */}
                    <div className="mt-16 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                                <div className="text-center">
                                    <BarChart3 className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">Dashboard Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Features</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                            Make Your Platform Work Harder for You
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Streamline academic project management with unified metrics and AI-powered plagiarism detection—all in one place.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Team Management",
                                description: "Create and manage student teams with role assignments, mentor mapping, and real-time collaboration tracking."
                            },
                            {
                                icon: Shield,
                                title: "AI Plagiarism Detection",
                                description: "Advanced AI-powered plagiarism checking with detailed similarity reports and source identification."
                            },
                            {
                                icon: BarChart3,
                                title: "Progress Tracking",
                                description: "Monitor project submissions, weekly reports, and team progress in one unified dashboard."
                            },
                            {
                                icon: CheckCircle,
                                title: "Smart Assessments",
                                description: "Comprehensive grading system with rubric-based evaluation and detailed feedback mechanisms."
                            },
                            {
                                icon: Zap,
                                title: "Real-Time Updates",
                                description: "Instant notifications for submissions, assessments, and team activities to stay always informed."
                            },
                            {
                                icon: TrendingUp,
                                title: "Analytics & Insights",
                                description: "Track department-wide metrics, submission trends, and student performance analytics."
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">Benefits</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
                            Benefits That Truly Matter to You
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Monitor academic progress as it happens, so you can respond quickly and keep educational goals on track.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            {
                                title: "Real-Time Collaboration",
                                description: "Monitor student activity and project updates instantly for smarter decision-making."
                            },
                            {
                                title: "All-in-One Platform",
                                description: "Keep all your project management, assessments, and analytics in one place."
                            },
                            {
                                title: "Actionable Insights",
                                description: "Track the metrics that matter most for academic excellence and student success."
                            },
                            {
                                title: "Secure & Reliable",
                                description: "Keep your academic data safe with advanced security and strong encryption."
                            },
                            {
                                title: "Custom Workflows",
                                description: "Create tailored assessment rubrics and project workflows that fit your institution."
                            },
                            {
                                title: "Simple to Use",
                                description: "Navigate easily—no steep learning curve, start managing projects immediately."
                            }
                        ].map((benefit, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all"
                            >
                                <CheckCircle className="h-6 w-6 text-green-500 mb-3" />
                                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your Academic Projects?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of students and educators who trust BrainFlow for seamless project management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl"
                            onClick={() => handleGetStarted('student')}
                        >
                            Get Started as Student
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6 rounded-xl"
                            onClick={() => handleGetStarted('teacher')}
                        >
                            Get Started as Teacher
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">BF</span>
                        </div>
                        <span className="text-2xl font-bold">BrainFlow</span>
                    </div>
                    <p className="text-gray-400 mb-4">
                        Empowering educational institutions with smart project management
                    </p>
                    <p className="text-gray-500 text-sm">
                        © 2025 BrainFlow. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
