import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create admin user
    const adminEmail = 'admin@brainflow.com'
    const adminPassword = 'Admin@123' // Change this in production!

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminEmail)
    } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10)

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'System Administrator',
                password: hashedPassword,
                role: UserRole.ADMIN,
                emailVerified: new Date(),
            }
        })

        // Create admin profile
        await prisma.adminProfile.create({
            data: {
                userId: admin.id,
                department: 'Administration',
                permissions: ['ALL']
            }
        })

        console.log('✅ Admin user created successfully!')
        console.log('📧 Email:', adminEmail)
        console.log('🔑 Password:', adminPassword)
        console.log('⚠️  Please change the password after first login!')
    }

    // Create a test student user (optional)
    const studentEmail = 'student@test.com'
    const studentPassword = 'Student@123'

    const existingStudent = await prisma.user.findUnique({
        where: { email: studentEmail }
    })

    if (!existingStudent) {
        const hashedPassword = await bcrypt.hash(studentPassword, 10)

        const student = await prisma.user.create({
            data: {
                email: studentEmail,
                name: 'Test Student',
                password: hashedPassword,
                role: UserRole.STUDENT,
                enrollmentNo: '220303124016',
                emailVerified: new Date(),
            }
        })

        await prisma.studentProfile.create({
            data: {
                userId: student.id,
                department: 'Computer Science',
                semester: 6,
                division: 'A',
                institution: 'Parul University',
                course: 'B.Tech'
            }
        })

        console.log('✅ Test student created successfully!')
        console.log('📧 Email:', studentEmail)
        console.log('🔑 Password:', studentPassword)
    }

    console.log('🎉 Seed completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

