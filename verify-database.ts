/**
 * Verify database data
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Verifying Database Data...\n')
    console.log('='.repeat(70))
    
    // Check Users
    console.log('\n📊 USERS TABLE:')
    console.log('-'.repeat(70))
    
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            enrollmentNo: true,
            emailVerified: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: 'asc'
        }
    })
    
    console.log(`\nTotal Users: ${users.length}\n`)
    
    users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No Name'}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Enrollment: ${user.enrollmentNo || 'N/A'}`)
        console.log(`   Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`)
        console.log(`   Created: ${user.createdAt.toISOString()}`)
        console.log('')
    })
    
    // Check if password field exists and has data
    console.log('='.repeat(70))
    console.log('\n🔐 PASSWORD FIELD CHECK:')
    console.log('-'.repeat(70))
    
    const usersWithPassword = await prisma.$queryRaw`
        SELECT email, 
               CASE 
                   WHEN password IS NULL THEN 'No Password'
                   WHEN password = '' THEN 'Empty Password'
                   ELSE 'Has Password (' || LENGTH(password) || ' chars)'
               END as password_status
        FROM "User"
        ORDER BY email
    ` as any[]
    
    usersWithPassword.forEach(user => {
        const icon = user.password_status.includes('Has Password') ? '✅' : '❌'
        console.log(`${icon} ${user.email}: ${user.password_status}`)
    })
    
    // Check Admin Profiles
    console.log('\n' + '='.repeat(70))
    console.log('\n👤 ADMIN PROFILES:')
    console.log('-'.repeat(70))
    
    const adminProfiles = await prisma.adminProfile.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                }
            }
        }
    })
    
    console.log(`\nTotal Admin Profiles: ${adminProfiles.length}\n`)
    
    adminProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.user.name}`)
        console.log(`   Email: ${profile.user.email}`)
        console.log(`   Profile ID: ${profile.id}`)
        console.log('')
    })
    
    // Check Student Profiles
    console.log('='.repeat(70))
    console.log('\n👨‍🎓 STUDENT PROFILES:')
    console.log('-'.repeat(70))
    
    const studentProfiles = await prisma.studentProfile.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    name: true,
                    enrollmentNo: true,
                }
            }
        }
    })
    
    console.log(`\nTotal Student Profiles: ${studentProfiles.length}\n`)
    
    studentProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.user.name}`)
        console.log(`   Email: ${profile.user.email}`)
        console.log(`   Enrollment: ${profile.user.enrollmentNo}`)
        console.log(`   Department: ${profile.department}`)
        console.log(`   Semester: ${profile.semester || 'N/A'}`)
        console.log(`   Division: ${profile.division || 'N/A'}`)
        console.log(`   Course: ${profile.course || 'N/A'}`)
        console.log('')
    })
    
    // Check Teams
    console.log('='.repeat(70))
    console.log('\n👥 TEAMS:')
    console.log('-'.repeat(70))
    
    const teams = await prisma.team.findMany({
        include: {
            leader: {
                select: {
                    name: true,
                    email: true,
                }
            },
            memberships: {
                include: {
                    studentProfile: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    
    console.log(`\nTotal Teams: ${teams.length}\n`)
    
    if (teams.length === 0) {
        console.log('No teams created yet.\n')
    } else {
        teams.forEach((team, index) => {
            console.log(`${index + 1}. ${team.name}`)
            console.log(`   Code: ${team.code}`)
            console.log(`   Department: ${team.department}`)
            console.log(`   Leader: ${team.leader.name} (${team.leader.email})`)
            console.log(`   Members: ${team.memberships.length}`)
            team.memberships.forEach(membership => {
                console.log(`      • ${membership.studentProfile.user.name} (${membership.role})`)
            })
            console.log('')
        })
    }
    
    // Summary
    console.log('='.repeat(70))
    console.log('\n📈 DATABASE SUMMARY:')
    console.log('-'.repeat(70))
    console.log(`\n   Total Users: ${users.length}`)
    console.log(`   Admin Profiles: ${adminProfiles.length}`)
    console.log(`   Student Profiles: ${studentProfiles.length}`)
    console.log(`   Teams: ${teams.length}`)
    console.log(`\n   Users with Passwords: ${usersWithPassword.filter(u => u.password_status.includes('Has Password')).length}`)
    console.log('')
    console.log('='.repeat(70))
    console.log('\n✅ Database verification complete!\n')
}

main()
    .catch((e) => {
        console.error('\n❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

