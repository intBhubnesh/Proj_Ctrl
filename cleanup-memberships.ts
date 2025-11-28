import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupMemberships() {
    console.log('🔍 Checking for orphaned team memberships...\n')

    try {
        // Find all student profiles
        const students = await prisma.studentProfile.findMany({
            include: {
                memberships: {
                    where: { leftAt: null }
                },
                currentTeam: true
            }
        })

        let fixedCount = 0

        for (const student of students) {
            const activeMemberships = student.memberships.filter(m => m.leftAt === null)
            
            // Case 1: Student has currentTeamId but no active membership
            if (student.currentTeamId && activeMemberships.length === 0) {
                console.log(`❌ Student ${student.id} has currentTeamId but no active membership`)
                console.log(`   Clearing currentTeamId...`)
                
                await prisma.studentProfile.update({
                    where: { id: student.id },
                    data: { currentTeamId: null }
                })
                fixedCount++
            }
            
            // Case 2: Student has active membership but no currentTeamId
            if (!student.currentTeamId && activeMemberships.length > 0) {
                console.log(`❌ Student ${student.id} has active membership but no currentTeamId`)
                console.log(`   Setting currentTeamId to ${activeMemberships[0].teamId}...`)
                
                await prisma.studentProfile.update({
                    where: { id: student.id },
                    data: { currentTeamId: activeMemberships[0].teamId }
                })
                fixedCount++
            }
            
            // Case 3: Student has multiple active memberships (should never happen)
            if (activeMemberships.length > 1) {
                console.log(`❌ Student ${student.id} has ${activeMemberships.length} active memberships!`)
                console.log(`   Keeping only the first one...`)
                
                // Mark all but the first as left
                for (let i = 1; i < activeMemberships.length; i++) {
                    await prisma.teamMembership.update({
                        where: { id: activeMemberships[i].id },
                        data: { leftAt: new Date() }
                    })
                }
                fixedCount++
            }
            
            // Case 4: currentTeamId doesn't match active membership
            if (student.currentTeamId && activeMemberships.length > 0) {
                if (student.currentTeamId !== activeMemberships[0].teamId) {
                    console.log(`❌ Student ${student.id} currentTeamId mismatch`)
                    console.log(`   currentTeamId: ${student.currentTeamId}`)
                    console.log(`   membership teamId: ${activeMemberships[0].teamId}`)
                    console.log(`   Fixing...`)
                    
                    await prisma.studentProfile.update({
                        where: { id: student.id },
                        data: { currentTeamId: activeMemberships[0].teamId }
                    })
                    fixedCount++
                }
            }
        }

        if (fixedCount === 0) {
            console.log('✅ No issues found! All memberships are clean.')
        } else {
            console.log(`\n✅ Fixed ${fixedCount} membership issues!`)
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

cleanupMemberships()

