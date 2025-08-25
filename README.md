# ProjectCtrl

A comprehensive project management system for educational institutions, built with **Next.js**, **Elysia.js**, **Prisma**, and **NeonDB**.

![ProjectCtrl Banner](https://via.placeholder.com/800x200/2563eb/ffffff?text=ProjectCtrl+-+Educational+Project+Management+System)

## 🚀 Features

- **User Management**: Students, Teachers, and Admin roles with distinct profiles
- **Team Management**: Team creation, member management, and mentor assignments
- **Project Tracking**: Project submissions, assessments, and progress monitoring
- **Plagiarism Detection**: Automated plagiarism checking for submissions
- **Notification System**: In-app and email notifications
- **Assessment System**: Comprehensive grading and feedback system
- **Audit Logging**: Complete activity tracking for transparency

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.5.0** - React framework with Turbopack
- **React 19.1.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling

### Backend
- **Elysia.js** - Fast and modern TypeScript web framework
- **Bun Runtime** - JavaScript runtime and package manager
- **TypeScript** - Type safety

### Database
- **NeonDB** - Serverless PostgreSQL database
- **Prisma 6.14.0** - Database ORM and migration tool

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required
- **Bun** (v1.0.0 or higher) - [Install Bun](https://bun.sh/docs/installation)
- **Git** - [Download](https://git-scm.com/)

### Optional
- **Docker** - For local PostgreSQL development (if not using NeonDB)

### Note on Package Manager
This project uses **Bun exclusively** for all package management and script execution. npm is not required and all npm references have been removed from the codebase.

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/proj-ctrl.git
cd proj-ctrl
```

### 2. Install Dependencies

```bash
# Install root dependencies
bun install

# Install frontend dependencies
cd frontend
bun install
cd ..

# Install backend dependencies
cd backend
bun install
cd ..
```

### 3. Database Setup

#### Option A: Using NeonDB (Recommended for Production)

1. **Create a NeonDB Account**
   - Visit [Neon Console](https://console.neon.tech/)
   - Sign up for a free account
   - Create a new project

2. **Get Your Connection String**
   - Go to your project dashboard
   - Click "Connection Details"
   - Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-example-123456.region.aws.neon.tech/dbname?sslmode=require
   ```

3. **Set Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and replace with your actual NeonDB connection string:
   ```env
   # NeonDB Configuration
   DATABASE_URL="your-neon-connection-string-here"
   DIRECT_URL="your-neon-connection-string-here"

   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```

#### Option B: Using Local PostgreSQL (Development)

1. **Start PostgreSQL using Docker**
   ```bash
   cd docker
   docker-compose up -d
   ```

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   # Local PostgreSQL
   DATABASE_URL="postgresql://admin:password@localhost:5432/college_db"
   DIRECT_URL="postgresql://admin:password@localhost:5432/college_db"

   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:8000"
   ```

### 4. Database Migration

```bash
# Generate Prisma Client
bun run db:generate

# Deploy schema to database
bunx prisma db push

# (Optional) Seed the database
bun run db:seed
```

### 5. Start the Development Servers

#### Option A: Start Both Frontend and Backend Together
```bash
bun run dev
```

#### Option B: Start Servers Separately
```bash
# Terminal 1 - Backend
bun run dev:backend

# Terminal 2 - Frontend
bun run dev:frontend
```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555) (run `bun run db:studio`)

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="your-database-connection-string"
DIRECT_URL="your-database-connection-string"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Optional: Email Configuration (for notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Optional: File Storage (AWS S3, Google Cloud, etc.)
STORAGE_PROVIDER=""
STORAGE_BUCKET=""
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
```

## 📱 Platform-Specific Setup

### Windows

1. **Install Node.js and npm**
   - Download from [nodejs.org](https://nodejs.org/)
   - Choose the LTS version

2. **Install Bun**
   ```powershell
   # Using PowerShell
   irm bun.sh/install.ps1 | iex
   ```

3. **Install Git**
   - Download from [git-scm.com](https://git-scm.com/)

4. **Follow the installation steps above**

### macOS

1. **Install Node.js and npm**
   ```bash
   # Using Homebrew
   brew install node

   # Or download from nodejs.org
   ```

2. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Install Git** (usually pre-installed)
   ```bash
   # Using Homebrew if not installed
   brew install git
   ```

4. **Follow the installation steps above**

### Linux (Ubuntu/Debian)

1. **Install Node.js and npm**
   ```bash
   # Update package index
   sudo apt update

   # Install Node.js and npm
   sudo apt install nodejs npm

   # Or use NodeSource repository for latest version
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Install Git**
   ```bash
   sudo apt install git
   ```

4. **Follow the installation steps above**

### Linux (CentOS/RHEL/Fedora)

1. **Install Node.js and npm**
   ```bash
   # Using dnf (Fedora) or yum (CentOS/RHEL)
   sudo dnf install nodejs npm
   # or
   sudo yum install nodejs npm
   ```

2. **Install Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

3. **Install Git**
   ```bash
   sudo dnf install git
   # or
   sudo yum install git
   ```

4. **Follow the installation steps above**

## 🗄️ Database Schema

The project uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Students, Teachers, and Admins
- **Teams**: Project teams with members and mentors
- **Projects**: Project details, submissions, and assessments
- **Notifications**: In-app and email notification system
- **Audit Logs**: Complete activity tracking

### Key Database Features
- **Role-based access control**
- **Team management with mentor assignments**
- **Project submission and assessment workflow**
- **Plagiarism detection integration**
- **Comprehensive audit logging**

## 📝 Available Scripts

### Root Level Scripts
```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend
npm run build           # Build frontend for production
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
```

### Frontend Scripts
```bash
cd frontend
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Backend Scripts
```bash
cd backend
bun run index.ts       # Start development server
bun run build          # Build for production (if configured)
```

## 🚀 Deployment

### Frontend Deployment (Vercel - Recommended)

1. **Connect to Vercel**
   - Push your code to GitHub
   - Import project in [Vercel](https://vercel.com/)
   - Set build command: `cd frontend && npm run build`
   - Set output directory: `frontend/.next`

2. **Environment Variables**
   - Add your environment variables in Vercel dashboard
   - Update `NEXT_PUBLIC_API_URL` to your production backend URL

### Backend Deployment

#### Railway (Recommended for Bun)
1. **Connect to Railway**
   - Import project from GitHub
   - Set start command: `cd backend && bun run index.ts`
   - Add environment variables

#### Heroku
1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   heroku buildpacks:set https://github.com/xmflsct/heroku-buildpack-bun.git
   ```

2. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Database (NeonDB is already cloud-hosted)
- Your NeonDB instance is already production-ready
- Update connection strings in production environment variables

## 🔍 API Endpoints

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID

### Team Management
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id/members` - Update team members

### Project Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/submissions` - Get project submissions

### Assessment
- `GET /api/assessments` - Get assessments
- `POST /api/assessments` - Create assessment
- `PUT /api/assessments/:id` - Update assessment

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure NeonDB instance is active
   - Check network connectivity

2. **Prisma Client Error**
   ```bash
   # Regenerate Prisma client
   npm run db:generate
   ```

3. **Port Already in Use**
   ```bash
   # Kill process using port 3000
   kill -9 $(lsof -ti:3000)

   # Kill process using port 8000
   kill -9 $(lsof -ti:8000)
   ```

4. **Bun Installation Issues**
   ```bash
   # Reinstall Bun
   curl -fsSL https://bun.sh/install | bash

   # Restart terminal and try again
   ```

5. **Node.js Version Issues**
   ```bash
   # Check Node version
   node --version

   # Use Node Version Manager if needed
   nvm install 18
   nvm use 18
   ```

### Performance Optimization

1. **Database Queries**
   - Use Prisma's `include` and `select` for efficient queries
   - Implement pagination for large datasets

2. **Frontend**
   - Enable Next.js image optimization
   - Use React.memo for expensive components

3. **Backend**
   - Use Bun's built-in performance features
   - Implement proper error handling

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Use TypeScript for type safety
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Prisma** for the excellent ORM
- **Neon** for serverless PostgreSQL
- **Vercel** for Next.js framework
- **Elysia.js** for the fast backend framework
- **Bun** for the modern JavaScript runtime

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues tab** on GitHub
2. **Create a new issue** with detailed information
3. **Join our Discord community** (if available)
4. **Email**: your-email@domain.com

---

**Happy Coding! 🚀**

Made with ❤️ for educational institutions worldwide.
