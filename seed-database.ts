/**
 * Database Seeding Script
 * Creates admin, teachers, students, teams, and test data
 *
 * Run with: bun run seed-database.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting comprehensive database seed...\n')

    // ============================================
    // 1. ADMIN USER
    // ============================================
    console.log('👤 Creating Admin User...')
    const adminEmail = 'admin@brainflow.com'
    const adminPassword = 'Admin@123'

    let admin
    try {
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        })

        if (existingAdmin) {
            console.log('   ✅ Admin already exists:', adminEmail)
            admin = existingAdmin
        } else {
            const hashedPassword = await bcrypt.hash(adminPassword, 10)

            admin = await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: 'System Administrator',
                    password: hashedPassword,
                    role: 'ADMIN',
                    emailVerified: new Date(),
                    externalSyncStatus: 'SYNCED',
                    syncedAt: new Date(),
                }
            })

            await prisma.adminProfile.create({
                data: {
                    userId: admin.id,
                }
            })

            console.log('   ✅ Admin created!')
            console.log('      📧 Email:', adminEmail)
            console.log('      🔑 Password:', adminPassword)
        }
    } catch (error: any) {
        console.error('   ❌ Error creating admin:', error.message)
    }

    // ============================================
    // 2. TEACHER/MENTOR USERS
    // ============================================
    console.log('\n👨‍🏫 Creating Teacher/Mentor Users...')

    const teachers = [
        {
            email: 'mentor1@paruluniversity.ac.in',
            name: 'Dr. Rajesh Kumar',
            password: 'Mentor@123',
            expertise: 'Web Development, Cloud Computing',
            technologies: 'React, Node.js, AWS',
            department: 'Computer Science'
        },
        {
            email: 'mentor2@paruluniversity.ac.in',
            name: 'Prof. Priya Sharma',
            password: 'Mentor@123',
            expertise: 'Machine Learning, AI',
            technologies: 'Python, TensorFlow, PyTorch',
            department: 'Computer Science'
        },
        {
            email: 'mentor3@paruluniversity.ac.in',
            name: 'Dr. Amit Patel',
            password: 'Mentor@123',
            expertise: 'Mobile Development, IoT',
            technologies: 'Flutter, React Native, Arduino',
            department: 'Information Technology'
        }
    ]

    const createdTeachers = []
    for (const teacherData of teachers) {
        try {
            const existing = await prisma.user.findUnique({
                where: { email: teacherData.email }
            })

            if (existing) {
                console.log(`   ✅ Teacher already exists: ${teacherData.email}`)
                createdTeachers.push(existing)
            } else {
                const hashedPassword = await bcrypt.hash(teacherData.password, 10)

                const teacher = await prisma.user.create({
                    data: {
                        email: teacherData.email,
                        name: teacherData.name,
                        password: hashedPassword,
                        role: 'TEACHER',
                        emailVerified: new Date(),
                        externalSyncStatus: 'SYNCED',
                        syncedAt: new Date(),
                    }
                })

                await prisma.teacherProfile.create({
                    data: {
                        userId: teacher.id,
                        expertise: teacherData.expertise,
                        technologies: teacherData.technologies,
                        department: teacherData.department,
                    }
                })

                createdTeachers.push(teacher)
                console.log(`   ✅ Created: ${teacherData.name} (${teacherData.email})`)
            }
        } catch (error: any) {
            console.error(`   ❌ Error creating teacher ${teacherData.email}:`, error.message)
        }
    }

    // ============================================
    // 3. STUDENT USERS
    // ============================================
    console.log('\n👨‍🎓 Creating Student Users...')

    const students = [
        {
            email: 'student1@paruluniversity.ac.in',
            name: 'Rahul Verma',
            password: 'Student@123',
            enrollmentNo: '220303124001',
            department: 'Computer Science',
            semester: 6,
            division: 'A',
            course: 'B.Tech'
        },
        {
            email: 'student2@paruluniversity.ac.in',
            name: 'Sneha Gupta',
            password: 'Student@123',
            enrollmentNo: '220303124002',
            department: 'Computer Science',
            semester: 6,
            division: 'A',
            course: 'B.Tech'
        },
        {
            email: 'student3@paruluniversity.ac.in',
            name: 'Arjun Singh',
            password: 'Student@123',
            enrollmentNo: '220303124003',
            department: 'Computer Science',
            semester: 6,
            division: 'A',
            course: 'B.Tech'
        },
        {
            email: 'student4@paruluniversity.ac.in',
            name: 'Priya Mehta',
            password: 'Student@123',
            enrollmentNo: '220303124004',
            department: 'Computer Science',
            semester: 6,
            division: 'A',
            course: 'B.Tech'
        },
        {
            email: 'student5@paruluniversity.ac.in',
            name: 'Vikram Joshi',
            password: 'Student@123',
            enrollmentNo: '220303124005',
            department: 'Information Technology',
            semester: 6,
            division: 'B',
            course: 'B.Tech'
        },
        {
            email: 'student6@paruluniversity.ac.in',
            name: 'Ananya Reddy',
            password: 'Student@123',
            enrollmentNo: '220303124006',
            department: 'Information Technology',
            semester: 6,
            division: 'B',
            course: 'B.Tech'
        }
    ]

    const createdStudents = []
    for (const studentData of students) {
        try {
            const existing = await prisma.user.findUnique({
                where: { email: studentData.email }
            })

            if (existing) {
                console.log(`   ✅ Student already exists: ${studentData.email}`)
                createdStudents.push(existing)
            } else {
                const hashedPassword = await bcrypt.hash(studentData.password, 10)

                const student = await prisma.user.create({
                    data: {
                        email: studentData.email,
                        name: studentData.name,
                        password: hashedPassword,
                        role: 'STUDENT',
                        enrollmentNo: studentData.enrollmentNo,
                        collegeEmail: studentData.email,
                        emailVerified: new Date(),
                        externalSyncStatus: 'SYNCED',
                        syncedAt: new Date(),
                    }
                })

                await prisma.studentProfile.create({
                    data: {
                        userId: student.id,
                        department: studentData.department,
                        semester: studentData.semester,
                        division: studentData.division,
                        institution: 'Parul University',
                        course: studentData.course,
                    }
                })

                createdStudents.push(student)
                console.log(`   ✅ Created: ${studentData.name} (${studentData.enrollmentNo})`)
            }
        } catch (error: any) {
            console.error(`   ❌ Error creating student ${studentData.email}:`, error.message)
        }
    }

    // ============================================
    // 4. CREATE TEAMS
    // ============================================
    console.log('\n👥 Creating Teams...')

    // Team 1: CS Team (students 1-4)
    try {
        const team1Leader = await prisma.user.findUnique({
            where: { enrollmentNo: '220303124001' },
            include: { studentProfile: true }
        })

        if (team1Leader && team1Leader.studentProfile) {
            const existingTeam = await prisma.team.findUnique({
                where: { leaderUserId: team1Leader.id }
            })

            if (!existingTeam) {
                const team1 = await prisma.team.create({
                    data: {
                        name: 'AI Research Team',
                        code: 'TEAM-CS001',
                        leaderUserId: team1Leader.id,
                        department: 'Computer Science',
                        currentMentorId: createdTeachers[0]?.id,
                    }
                })

                // Update leader's profile
                await prisma.studentProfile.update({
                    where: { userId: team1Leader.id },
                    data: { currentTeamId: team1.id }
                })

                // Add team memberships
                await prisma.teamMembership.create({
                    data: {
                        teamId: team1.id,
                        studentProfileId: team1Leader.studentProfile.id,
                        role: 'LEADER',
                        joinedAt: new Date(),
                    }
                })

                // Add other members (students 2, 3, 4)
                for (const enrollmentNo of ['220303124002', '220303124003', '220303124004']) {
                    const member = await prisma.user.findUnique({
                        where: { enrollmentNo },
                        include: { studentProfile: true }
                    })

                    if (member && member.studentProfile) {
                        await prisma.studentProfile.update({
                            where: { userId: member.id },
                            data: { currentTeamId: team1.id }
                        })

                        await prisma.teamMembership.create({
                            data: {
                                teamId: team1.id,
                                studentProfileId: member.studentProfile.id,
                                role: 'MEMBER',
                                joinedAt: new Date(),
                            }
                        })
                    }
                }

                console.log('   ✅ Created Team: AI Research Team (TEAM-CS001)')
            } else {
                console.log('   ✅ Team already exists for leader:', team1Leader.email)
            }
        }
    } catch (error: any) {
        console.error('   ❌ Error creating Team 1:', error.message)
    }

    // Team 2: IT Team (students 5-6)
    try {
        const team2Leader = await prisma.user.findUnique({
            where: { enrollmentNo: '220303124005' },
            include: { studentProfile: true }
        })

        if (team2Leader && team2Leader.studentProfile) {
            const existingTeam = await prisma.team.findUnique({
                where: { leaderUserId: team2Leader.id }
            })

            if (!existingTeam) {
                const team2 = await prisma.team.create({
                    data: {
                        name: 'IoT Innovation Lab',
                        code: 'TEAM-IT001',
                        leaderUserId: team2Leader.id,
                        department: 'Information Technology',
                        currentMentorId: createdTeachers[2]?.id,
                    }
                })

                await prisma.studentProfile.update({
                    where: { userId: team2Leader.id },
                    data: { currentTeamId: team2.id }
                })

                await prisma.teamMembership.create({
                    data: {
                        teamId: team2.id,
                        studentProfileId: team2Leader.studentProfile.id,
                        role: 'LEADER',
                        joinedAt: new Date(),
                    }
                })

                // Add student 6
                const member = await prisma.user.findUnique({
                    where: { enrollmentNo: '220303124006' },
                    include: { studentProfile: true }
                })

                if (member && member.studentProfile) {
                    await prisma.studentProfile.update({
                        where: { userId: member.id },
                        data: { currentTeamId: team2.id }
                    })

                    await prisma.teamMembership.create({
                        data: {
                            teamId: team2.id,
                            studentProfileId: member.studentProfile.id,
                            role: 'MEMBER',
                            joinedAt: new Date(),
                        }
                    })
                }

                console.log('   ✅ Created Team: IoT Innovation Lab (TEAM-IT001)')
            } else {
                console.log('   ✅ Team already exists for leader:', team2Leader.email)
            }
        }
    } catch (error: any) {
        console.error('   ❌ Error creating Team 2:', error.message)
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Database Seeding Complete!')
    console.log('='.repeat(60))

    console.log('\n📊 Summary:')
    console.log('   • 1 Admin user')
    console.log('   • 3 Teacher/Mentor users')
    console.log('   • 6 Student users')
    console.log('   • 2 Teams created')

    console.log('\n🔑 Login Credentials:')
    console.log('\n   👤 ADMIN:')
    console.log('      Email: admin@brainflow.com')
    console.log('      Password: Admin@123')

    console.log('\n   👨‍🏫 TEACHERS:')
    console.log('      Email: mentor1@paruluniversity.ac.in')
    console.log('      Password: Mentor@123')

    console.log('\n   👨‍🎓 STUDENTS:')
    console.log('      Email: student1@paruluniversity.ac.in')
    console.log('      Password: Student@123')
    console.log('      (student2-6 also available with same password)')

    console.log('\n⚠️  Remember to change these passwords in production!\n')
}

main()
    .catch((e) => {
        console.error('\n❌ Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
