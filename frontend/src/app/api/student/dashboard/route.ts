import { NextRequest, NextResponse } from 'next/server'
import { requireStudent } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // Use auth helper for authentication and role check
        const { session, error } = await requireStudent()
        if (error) return error

        // Get student profile with team and project details
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                currentTeam: {
                    include: {
                        memberships: {
                            include: {
                                studentProfile: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        project: {
                            include: {
                                srsReport: true,
                                submissions: {
                                    orderBy: {
                                        createdAt: 'desc'
                                    },
                                    take: 1,
                                    include: {
                                        plagiarismReport: true,
                                        reportFile: true
                                    }
                                },
                                assessments: {
                                    orderBy: {
                                        createdAt: 'desc'
                                    },
                                    include: {
                                        mentor: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        currentMentor: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!studentProfile) {
            return NextResponse.json(
                { error: 'Student profile not found' },
                { status: 404 }
            )
        }

        // Get notifications for the user
        const notifications = await prisma.userNotification.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                notification: {
                    include: {
                        createdBy: {
                            select: {
                                id: true,
                                name: true,
                                role: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                notification: {
                    createdAt: 'desc'
                }
            },
            take: 20
        })

        // Format the response
        const team = studentProfile.currentTeam
        const project = team?.project
        const latestSubmission = project?.submissions[0]
        const plagiarismReport = latestSubmission?.plagiarismReport

        // Find user's role in team
        const userMembership = team?.memberships.find(
            m => m.studentProfile.userId === session.user.id
        )

        const dashboardData = {
            student: {
                id: studentProfile.id,
                userId: studentProfile.userId,
                enrollmentNumber: studentProfile.enrollmentNumber,
                department: studentProfile.department,
                semester: studentProfile.semester,
                division: studentProfile.division,
                institution: studentProfile.institution,
                course: studentProfile.course,
                user: studentProfile.user
            },
            team: team ? {
                id: team.id,
                name: team.name,
                code: team.code,
                department: team.department,
                isValidated: team.isValidated,
                isVerified: team.isVerified,
                validatedAt: team.validatedAt,
                createdAt: team.createdAt,
                memberCount: team.memberships.length,
                userRole: userMembership?.role || 'MEMBER',
                isLeader: userMembership?.role === 'LEADER',
                members: team.memberships.map(m => ({
                    id: m.id,
                    role: m.role,
                    joinedAt: m.joinedAt,
                    student: {
                        id: m.studentProfile.id,
                        userId: m.studentProfile.userId,
                        enrollmentNumber: m.studentProfile.enrollmentNumber,
                        user: m.studentProfile.user
                    }
                })),
                mentor: team.currentMentor
            } : null,
            project: project ? {
                id: project.id,
                technology: project.technology,
                domain: project.domain,
                problemStatement: project.problemStatement,
                repoUrl: project.repoUrl,
                pptUrl: project.pptUrl,
                srsReport: project.srsReport ? {
                    id: project.srsReport.id,
                    fileName: project.srsReport.fileName,
                    storageUrl: project.srsReport.storageUrl
                } : null,
                plagiarismScore: plagiarismReport?.similarityPct || null,
                plagiarismStatus: plagiarismReport?.status || null,
                latestSubmission: latestSubmission ? {
                    id: latestSubmission.id,
                    attemptNo: latestSubmission.attemptNo,
                    status: latestSubmission.status,
                    createdAt: latestSubmission.createdAt
                } : null,
                assessments: project.assessments.map(a => ({
                    id: a.id,
                    status: a.status,
                    totalMarks: a.totalMarks,
                    remarks: a.remarks,
                    createdAt: a.createdAt,
                    mentor: a.mentor
                }))
            } : null,
            notifications: notifications.map(un => ({
                id: un.id,
                readAt: un.readAt,
                notification: {
                    id: un.notification.id,
                    title: un.notification.title,
                    message: un.notification.message,
                    priority: un.notification.priority,
                    createdAt: un.notification.createdAt,
                    createdBy: un.notification.createdBy
                }
            }))
        }

        return NextResponse.json(dashboardData)

    } catch (error) {
        console.error('❌ Dashboard API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        )
    }
}


