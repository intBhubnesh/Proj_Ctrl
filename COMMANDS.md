# Quick Command Reference

## 🚀 Main Commands

### Start Everything (One Command)
```bash
./start-project.sh
```
**This is the main command you need!** It will:
- Check prerequisites
- Start PostgreSQL database  
- Install dependencies
- Run migrations
- Start frontend & backend
- Monitor services

### Stop Everything
```bash
./stop-project.sh
```

## 🔧 Development Commands

### Start Services Individually
```bash
npm run dev:frontend    # Next.js frontend only (port 3000)
npm run dev:backend     # Elysia.js backend only (port 8000)
npm run dev             # Both frontend & backend together
```

### Database Commands
```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio (GUI)
```

## 🧪 Testing & Verification

### Test Setup
```bash
./test-setup.sh         # Verify all components are working
```

### Manual Database Management
```bash
# Start PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# Stop PostgreSQL  
docker compose -f docker/docker-compose.yml down

# View running containers
docker ps
```

## 📊 Service URLs

After running `./start-project.sh`, access:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Database**: postgresql://admin:password@localhost:5432/college_db

## 📝 Log Files

When using `./start-project.sh`, check logs in:
- `logs/frontend.log` - Next.js output
- `logs/backend.log` - Elysia.js output

## 🛠️ Build Commands

```bash
npm run build           # Build Next.js for production
```

## 💡 Pro Tips

1. **Always use `./start-project.sh`** for the best experience
2. **Press Ctrl+C** in the terminal where start-project.sh is running to stop all services
3. **Check logs/** directory if something goes wrong
4. **Use `npm run db:studio`** to visually explore your database
