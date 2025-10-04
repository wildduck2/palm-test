import * as crypto from 'crypto'
import { db } from './db'
import { accessTokens, otpCodes, services, users } from './tables'

/**
 * Helper function to hash passwords (use bcrypt in production)
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Helper function to generate a random 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Helper function to generate a random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('Starting database seeding...')

    // Clear existing data (optional - comment out if you want to preserve data)
    console.log(' Clearing existing data...')
    await db.delete(accessTokens)
    await db.delete(otpCodes)
    await db.delete(services)
    await db.delete(users)

    // Seed Users
    console.log('Seeding users...')
    const insertedUsers = await db
      .insert(users)
      .values([
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          email: 'john.doe@example.com',
          first_name: 'John',
          is_active: true,
          last_login_at: new Date(),
          last_name: 'Doe',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'dark' },
          username: 'johndoe',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
          email: 'jane.smith@example.com',
          first_name: 'Jane',
          is_active: true,
          last_login_at: new Date(Date.now() - 86400000), // 1 day ago
          last_name: 'Smith',
          password_hash: '$2a$12$KWOOlMWzhjQ2wLFYzPJ04OxICnhkJajIapYeqq1WLIEUE/IOzT8mW',
          settings: { notifications: false, theme: 'light' },
          username: 'janesmith',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
          email: 'bob.johnson@example.com',
          first_name: 'Bob',
          is_active: false,
          last_login_at: new Date(Date.now() - 2592000000), // 30 days ago
          last_name: 'Johnson',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'dark' },
          username: 'bobjohnson',
        },
        {
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
          email: 'alice.williams@example.com',
          first_name: 'Alice',
          is_active: true,
          last_name: 'Williams',
          password_hash: hashPassword('password123'),
          settings: { notifications: true, theme: 'auto' },
          username: 'alicewilliams',
        },
      ])
      .returning()

    console.log(`Created ${insertedUsers.length} users`)

    // Seed Services
    console.log('🔧 Seeding services...')
    const insertedServices = await db
      .insert(services)
      .values([
        {
          description: 'GitHub API integration for repository management',
          name: 'GitHub',
        },
        {
          description: 'Google OAuth and API services',
          name: 'Google',
        },
        {
          description: 'Payment processing and subscription management',
          name: 'Stripe',
        },
        {
          description: 'Amazon Web Services cloud infrastructure',
          name: 'AWS',
        },
        {
          description: 'Email delivery service',
          name: 'SendGrid',
        },
      ])
      .returning()

    console.log(`Created ${insertedServices.length} services`)

    // Seed OTP Codes
    console.log('Seeding OTP codes...')
    const otpCodesData = insertedUsers.slice(0, 2).map((user) => ({
      code: generateOTP(),
      expires_at: new Date(Date.now() + 600000), // 10 minutes from now
      is_active: true,
      user_id: user.id,
    }))

    // Add an expired OTP for testing
    otpCodesData.push({
      code: generateOTP(),
      expires_at: new Date(Date.now() - 600000), // 10 minutes ago (expired)
      is_active: false,
      user_id: insertedUsers[0].id,
    })

    const insertedOtpCodes = await db.insert(otpCodes).values(otpCodesData).returning()

    console.log(`Created ${insertedOtpCodes.length} OTP codes`)

    // Seed Access Tokens
    console.log('Seeding access tokens...')
    const accessTokensData = []

    // Create tokens for each service
    for (const service of insertedServices) {
      // Active token for first user
      accessTokensData.push({
        expires_at: new Date(Date.now() + 2592000000), // 30 days from now
        name: service.name,
        service_id: service.id,
        status: 'active',
        token: generateToken(),
        user_id: insertedUsers[0].id,
      })

      // Some tokens without users (service-level tokens)
      if (service.name === 'SendGrid' || service.name === 'AWS') {
        accessTokensData.push({
          expires_at: new Date(Date.now() + 7776000000), // 90 days from now
          name: service.name,
          service_id: service.id,
          status: 'active',
          token: generateToken(),
          user_id: null,
        })
      }
    }

    // Add some expired and revoked tokens
    accessTokensData.push(
      {
        expires_at: new Date(Date.now() - 86400000), // 1 day ago
        name: insertedServices[0].name,
        service_id: insertedServices[0].id,
        status: 'expired',
        token: generateToken(),
        user_id: insertedUsers[1].id,
      },
      {
        expires_at: new Date(Date.now() + 2592000000), // 30 days from now
        name: insertedServices[1].name,
        service_id: insertedServices[1].id,
        status: 'revoked',
        token: generateToken(),
        user_id: insertedUsers[2].id,
      },
    )

    const insertedTokens = await db.insert(accessTokens).values(accessTokensData).returning()

    console.log(`Created ${insertedTokens.length} access tokens`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\nSummary:')
    console.log(`   Users: ${insertedUsers.length}`)
    console.log(`   Services: ${insertedServices.length}`)
    console.log(`   OTP Codes: ${insertedOtpCodes.length}`)
    console.log(`   Access Tokens: ${insertedTokens.length}`)
    console.log('\nTest credentials:')
    console.log('   Email: john.doe@example.com')
    console.log('   Password: password123')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log('Seed script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed script failed:', error)
    process.exit(1)
  })
