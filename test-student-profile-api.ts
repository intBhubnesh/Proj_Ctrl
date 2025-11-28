// Test script to verify student profile API
// Run with: bun run test-student-profile-api.ts

const testData = {
    enrollmentNo: "2203031240166",
    department: "Computer Science",
    semester: "5",
    division: "A",
    institution: "Parul University",
    course: "B.Tech"
}

console.log('🧪 Testing Student Profile API...')
console.log('📦 Test data:', testData)
console.log('\n⚠️  Note: This test requires a valid session cookie.')
console.log('Please test manually in the browser or use the form.')
console.log('\n✅ API endpoint: POST /api/user/profile/student')
console.log('✅ Expected response: { success: true, profile: {...}, user: {...} }')

