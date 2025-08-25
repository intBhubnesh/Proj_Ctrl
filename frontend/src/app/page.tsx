"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const userTypes = [
    {
      type: 'student',
      title: 'Student',
      description: 'Join or create teams, submit projects, and track your progress',
      icon: '🎓',
      features: ['Team Management', 'Project Submission', 'Weekly Reports', 'Assessment Tracking'],
      route: '/auth/login'
    },
    {
      type: 'teacher',
      title: 'Teacher',
      description: 'Mentor teams, assess projects, and provide feedback',
      icon: '👨‍🏫',
      features: ['Team Mentoring', 'Project Assessment', 'Progress Tracking', 'Feedback System'],
      route: '/auth/login'
    },
    {
      type: 'admin',
      title: 'Admin',
      description: 'Manage teams, mentors, and system-wide assessments',
      icon: '⚙️',
      features: ['Team Management', 'Mentor Assignment', 'System Analytics', 'Data Export'],
      route: '/auth/login'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Student Project Management System
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Streamline project submissions, team collaboration, and assessment processes
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Role
          </h2>
          <p className="text-lg text-gray-600">
            Select your role to access the appropriate dashboard and features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {userTypes.map((userType) => (
            <Card 
              key={userType.type} 
              className="hover:shadow-xl transition-shadow cursor-pointer group"
              onClick={() => router.push(userType.route)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-3xl">{userType.icon}</span>
                </div>
                <CardTitle className="text-2xl">{userType.title}</CardTitle>
                <CardDescription className="text-base">
                  {userType.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {userType.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full group-hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(userType.route)
                  }}
                >
                  Continue as {userType.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need for effective project management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '👥', title: 'Team Collaboration', desc: 'Form teams and collaborate effectively' },
              { icon: '📋', title: 'Project Submission', desc: 'Submit and track project progress' },
              { icon: '🔍', title: 'Plagiarism Check', desc: 'Automated plagiarism detection' },
              { icon: '📊', title: 'Assessment Tools', desc: 'Comprehensive evaluation system' }
            ].map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Student Project Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
