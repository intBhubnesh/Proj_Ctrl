import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedTestUsers() {
    console.log('🌱 Seeding test users...\n')

    try {
        // Hash password for all users
        const hashedPassword = await bcrypt.hash('password123', 10)

        // Student accounts
        const students = [
            {
                email: '2203031240167@paruluniversity.ac.in',
                name: 'Test Student 1',
                enrollmentNumber: '2203031240167',
                department: 'AIDS',
                semester: 8,
                division: '8',
                institution: 'PIET',
                course: 'B.Tech'
            },
            {
                email: '2203031240168@paruluniversity.ac.in',
                name: 'Test Student 2',
                enrollmentNumber: '2203031240168',
                department: 'AIDS',
                semester: 8,
                division: '8',
                institution: 'PIET',
                course: 'B.Tech'
            }
        ]

        // Teacher accounts
        const teachers = [
            {
                email: 'teacher1@paruluniversity.ac.in',
                name: 'Dr. Rajesh Kumar',
                department: 'AIDS',
                expertise: 'Machine Learning, Data Science',
                technologies: 'Python, TensorFlow, PyTorch'
            },
            {
                email: 'teacher2@paruluniversity.ac.in',
                name: 'Prof. Priya Sharma',
                department: 'Computer Science',
                expertise: 'Web Development, Cloud Computing',
                technologies: 'React, Node.js, AWS, Docker'
            }
        ]

        // Create students
        console.log('👨‍🎓 Creating student accounts...\n')
        for (const student of students) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: student.email }
            })

            if (existingUser) {
                console.log(`⚠️  Student ${student.email} already exists, skipping...`)
                continue
            }

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: student.email,
                    name: student.name,
                    password: hashedPassword,
                    role: 'STUDENT',
                    enrollmentNo: student.enrollmentNumber,
                    collegeEmail: student.email,
                    externalSyncStatus: 'SYNCED',
                    syncedAt: new Date()
                }
            })

            // Create student profile
            await prisma.studentProfile.create({
                data: {
                    userId: user.id,
                    department: student.department,
                    semester: student.semester,
                    division: student.division,
                    institution: student.institution,
                    course: student.course
                }
            })

            console.log(`✅ Created student: ${student.email}`)
            console.log(`   Password: password123`)
            console.log(`   Enrollment: ${student.enrollmentNumber}\n`)
        }

        // Create teachers
        console.log('\n👨‍🏫 Creating teacher accounts...\n')
        for (const teacher of teachers) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: teacher.email }
            })

            if (existingUser) {
                console.log(`⚠️  Teacher ${teacher.email} already exists, skipping...`)
                continue
            }

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: teacher.email,
                    name: teacher.name,
                    password: hashedPassword,
                    role: 'TEACHER',
                    collegeEmail: teacher.email,
                    externalSyncStatus: 'SYNCED',
                    syncedAt: new Date()
                }
            })

            // Create teacher profile
            await prisma.teacherProfile.create({
                data: {
                    userId: user.id,
                    department: teacher.department,
                    expertise: teacher.expertise,
                    technologies: teacher.technologies
                }
            })

            console.log(`✅ Created teacher: ${teacher.email}`)
            console.log(`   Password: password123`)
            console.log(`   Name: ${teacher.name}\n`)
        }

        console.log('\n🎉 Test users seeded successfully!\n')
        console.log('📝 Summary:')
        console.log('   Students: 2 accounts created')
        console.log('   Teachers: 2 accounts created')
        console.log('   Default password for all: password123\n')

    } catch (error) {
        console.error('❌ Error seeding test users:', error)
    } finally {
        await prisma.$disconnect()
    }
}

seedTestUsers()

