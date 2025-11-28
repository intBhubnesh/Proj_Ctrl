/**
 * Test Google OAuth Credentials
 * This script checks if your Google OAuth credentials are valid
 */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const NEXTAUTH_URL = process.env.NEXTAUTH_URL

console.log('🔍 Checking Google OAuth Configuration...\n')
console.log('='.repeat(70))

// Check if credentials are set
console.log('\n📋 Environment Variables:')
console.log('-'.repeat(70))

if (GOOGLE_CLIENT_ID) {
    console.log('✅ GOOGLE_CLIENT_ID is set')
    console.log(`   Value: ${GOOGLE_CLIENT_ID.substring(0, 20)}...`)
} else {
    console.log('❌ GOOGLE_CLIENT_ID is NOT set')
}

if (GOOGLE_CLIENT_SECRET) {
    console.log('✅ GOOGLE_CLIENT_SECRET is set')
    console.log(`   Value: ${GOOGLE_CLIENT_SECRET.substring(0, 10)}...`)
} else {
    console.log('❌ GOOGLE_CLIENT_SECRET is NOT set')
}

if (NEXTAUTH_URL) {
    console.log('✅ NEXTAUTH_URL is set')
    console.log(`   Value: ${NEXTAUTH_URL}`)
} else {
    console.log('❌ NEXTAUTH_URL is NOT set')
}

// Check credential format
console.log('\n' + '='.repeat(70))
console.log('\n🔐 Credential Validation:')
console.log('-'.repeat(70))

if (GOOGLE_CLIENT_ID) {
    if (GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
        console.log('✅ Client ID format looks correct')
    } else {
        console.log('⚠️  Client ID format may be incorrect')
        console.log('   Expected format: *.apps.googleusercontent.com')
    }
}

if (GOOGLE_CLIENT_SECRET) {
    if (GOOGLE_CLIENT_SECRET.startsWith('GOCSPX-')) {
        console.log('✅ Client Secret format looks correct')
    } else {
        console.log('⚠️  Client Secret format may be incorrect')
        console.log('   Expected format: GOCSPX-*')
    }
}

// Test OAuth endpoint
console.log('\n' + '='.repeat(70))
console.log('\n🌐 Testing Google OAuth Endpoint:')
console.log('-'.repeat(70))

async function testGoogleOAuth() {
    try {
        const response = await fetch('https://accounts.google.com/.well-known/openid-configuration')
        
        if (response.ok) {
            console.log('✅ Google OAuth endpoint is accessible')
            const data = await response.json()
            console.log(`   Authorization endpoint: ${data.authorization_endpoint}`)
            console.log(`   Token endpoint: ${data.token_endpoint}`)
        } else {
            console.log('❌ Google OAuth endpoint returned error:', response.status)
        }
    } catch (error: any) {
        console.log('❌ Failed to reach Google OAuth endpoint:', error.message)
    }
}

await testGoogleOAuth()

// Required Google Cloud Console Configuration
console.log('\n' + '='.repeat(70))
console.log('\n⚙️  Required Google Cloud Console Configuration:')
console.log('-'.repeat(70))
console.log('\n1. Go to: https://console.cloud.google.com/')
console.log('2. Navigate to: APIs & Services > Credentials')
console.log('3. Click on your OAuth 2.0 Client ID')
console.log('\n4. Add these URLs:')
console.log('\n   Authorized JavaScript Origins:')
console.log('   • http://localhost:3000')
console.log('\n   Authorized Redirect URIs:')
console.log('   • http://localhost:3000/api/auth/callback/google')

// Admin credentials reminder
console.log('\n' + '='.repeat(70))
console.log('\n🔑 ADMIN LOGIN CREDENTIALS:')
console.log('-'.repeat(70))
console.log('\n   Email: admin@brainflow.com')
console.log('   Password: Admin@123')
console.log('\n   Use these to login with email/password (not Google)')

console.log('\n' + '='.repeat(70))
console.log('\n📝 Summary:')
console.log('-'.repeat(70))

const allSet = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && NEXTAUTH_URL
if (allSet) {
    console.log('\n✅ All environment variables are set')
    console.log('\nIf Google login still fails, the credentials may be:')
    console.log('   • Expired or revoked')
    console.log('   • Not configured in Google Cloud Console')
    console.log('   • Missing redirect URI configuration')
    console.log('\n💡 Solution: Use admin credentials to login, or create new Google OAuth credentials')
} else {
    console.log('\n❌ Some environment variables are missing')
    console.log('   Please check your .env file')
}

console.log('\n' + '='.repeat(70))
console.log('')

