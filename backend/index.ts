import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { PrismaClient, Role } from '../node_modules/@prisma/client'

const prisma = new PrismaClient()

const app = new Elysia()
  .use(cors({
    origin: 'http://localhost:3000', // Next.js frontend URL
    credentials: true
  }))
  .get('/', () => 'Hello from Elysia!')
  .get('/api/health', () => ({ status: 'ok', message: 'Backend is running' }))
  
  // User routes
  .get('/api/users', async () => {
    const users = await prisma.user.findMany({
      include: {
        student: true,
        faculty: true
      }
    })
    return users
  })
  
  .post('/api/users', async ({ body }: { body: any }) => {
    const { name, email, role } = body
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role as Role
      }
    })
    return user
  })
  
  // Project routes
  .get('/api/projects', async () => {
    const projects = await prisma.projectDetail.findMany({
      include: {
        domain: true,
        techStack: true,
        team: true
      }
    })
    return projects
  })
  
  // Domain routes
  .get('/api/domains', async () => {
    const domains = await prisma.domain.findMany()
    return domains
  })
  
  // Technology routes
  .get('/api/technologies', async () => {
    const technologies = await prisma.technology.findMany()
    return technologies
  })
  
  // Team routes
  .get('/api/teams', async () => {
    const teams = await prisma.team.findMany({
      include: {
        students: {
          include: {
            user: true
          }
        },
        projects: true
      }
    })
    return teams
  })
  
  .listen(8000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
