/**
 * Check database structure and seed with SQL
 * This bypasses Prisma client generation issues
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking database structure...\n')

    // Check if password column exists
    try {
        const result = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User' 
            AND column_name = 'password'
        `
        
        console.log('Password column check:', result)
        
        if (Array.isArray(result) && result.length === 0) {
            console.log('\n⚠️  Password column does NOT exist. Adding it...\n')
            
            await prisma.$executeRaw`
                ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT
            `
            
            console.log('✅ Password column added!\n')
        } else {
            console.log('✅ Password column exists!\n')
        }
    } catch (error: any) {
        console.error('Error checking password column:', error.message)
    }

    // Check existing users
    console.log('📊 Checking existing users...\n')
    
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                enrollmentNo: true,
            },
            take: 10
        })
        
        console.log(`Found ${users.length} users:`)
        users.forEach(user => {
            console.log(`  • ${user.email} (${user.role}) - ${user.name || 'No name'}`)
        })
        console.log('')
    } catch (error: any) {
        console.error('Error fetching users:', error.message)
    }

    // Create admin if doesn't exist
    console.log('👤 Creating/Updating Admin user...\n')
    
    const adminEmail = 'admin@brainflow.com'
    const adminPassword = 'Admin@123'
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10)
    
    try {
        // Use upsert to create or update
        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                // Update password if user exists
                name: 'System Administrator',
                role: 'ADMIN',
            },
            create: {
                email: adminEmail,
                name: 'System Administrator',
                role: 'ADMIN',
                emailVerified: new Date(),
                externalSyncStatus: 'SYNCED',
                syncedAt: new Date(),
            }
        })
        
        // Update password using raw SQL (since Prisma client might not know about password field)
        await prisma.$executeRaw`
            UPDATE "User" 
            SET password = ${hashedAdminPassword}
            WHERE email = ${adminEmail}
        `
        
        console.log('✅ Admin user ready!')
        console.log(`   Email: ${adminEmail}`)
        console.log(`   Password: ${adminPassword}`)
        console.log(`   ID: ${admin.id}\n`)
        
        // Ensure admin profile exists
        const adminProfile = await prisma.adminProfile.findUnique({
            where: { userId: admin.id }
        })
        
        if (!adminProfile) {
            await prisma.adminProfile.create({
                data: {
                    userId: admin.id,
                }
            })
            console.log('✅ Admin profile created!\n')
        } else {
            console.log('✅ Admin profile exists!\n')
        }
        
    } catch (error: any) {
        console.error('❌ Error with admin user:', error.message)
    }

    // Create test students
    console.log('👨‍🎓 Creating test students...\n')
    
    const testStudents = [
        {
            email: 'student1@paruluniversity.ac.in',
            name: 'Rahul Verma',
            enrollmentNo: '220303124001',
            department: 'Computer Science',
        },
        {
            email: 'student2@paruluniversity.ac.in',
            name: 'Sneha Gupta',
            enrollmentNo: '220303124002',
            department: 'Computer Science',
        }
    ]
    
    const studentPassword = 'Student@123'
    const hashedStudentPassword = await bcrypt.hash(studentPassword, 10)
    
    for (const studentData of testStudents) {
        try {
            const student = await prisma.user.upsert({
                where: { email: studentData.email },
                update: {
                    name: studentData.name,
                    role: 'STUDENT',
                    enrollmentNo: studentData.enrollmentNo,
                },
                create: {
                    email: studentData.email,
                    name: studentData.name,
                    role: 'STUDENT',
                    enrollmentNo: studentData.enrollmentNo,
                    collegeEmail: studentData.email,
                    emailVerified: new Date(),
                    externalSyncStatus: 'SYNCED',
                    syncedAt: new Date(),
                }
            })
            
            // Update password
            await prisma.$executeRaw`
                UPDATE "User" 
                SET password = ${hashedStudentPassword}
                WHERE email = ${studentData.email}
            `
            
            // Ensure student profile exists
            const profile = await prisma.studentProfile.findUnique({
                where: { userId: student.id }
            })
            
            if (!profile) {
                await prisma.studentProfile.create({
                    data: {
                        userId: student.id,
                        department: studentData.department,
                        semester: 6,
                        division: 'A',
                        institution: 'Parul University',
                        course: 'B.Tech',
                    }
                })
            }
            
            console.log(`✅ ${studentData.name} (${studentData.email})`)
            
        } catch (error: any) {
            console.error(`❌ Error with ${studentData.email}:`, error.message)
        }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Database Check and Seed Complete!')
    console.log('='.repeat(60))
    console.log('\n🔑 Login Credentials:')
    console.log(`\n   Admin: ${adminEmail} / ${adminPassword}`)
    console.log(`   Student: student1@paruluniversity.ac.in / ${studentPassword}`)
    console.log('\n⚠️  Change passwords in production!\n')
}

main()
    .catch((e) => {
        console.error('\n❌ Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

