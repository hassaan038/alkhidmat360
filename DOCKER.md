# Docker Setup Guide for Alkhidmat 360

Complete Docker containerization for easy development and deployment.

## Architecture

The application is containerized with three main services:

1. **MySQL Database** (Port 3307)
   - MySQL 8.0
   - Persistent volume for data
   - Health checks enabled

2. **Server (Backend)** (Port 5000)
   - Node.js 18 Alpine
   - Express + Prisma
   - Auto-runs migrations on startup
   - Hot reload with volume mounts

3. **Client (Frontend)** (Port 5173)
   - Node.js 18 Alpine
   - React + Vite
   - Hot reload enabled
   - Development mode

All services are connected via a custom bridge network: `alkhidmat-network`

## Quick Start

### Prerequisites

- Docker (v20+)
- Docker Compose (v2+)

### One Command Setup

```bash
# Start everything with Docker
make docker-up
```

That's it! The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Database**: localhost:3307

**Important:** The `.env.docker` files are pre-configured and committed to the repository. The `make docker-up` command will automatically:
1. Verify environment files exist
2. Build Docker images
3. Start all services
4. Run database migrations
5. Seed database with test users

**Test Credentials:**
- **Admin**: admin@alkhidmat360.com / admin123
- **Donor**: donor@test.com / donor123
- **Beneficiary**: beneficiary@test.com / beneficiary123
- **Volunteer**: volunteer@test.com / volunteer123

## Available Docker Commands

```bash
make docker-build    # Build all Docker images
make docker-up       # Start all services (detached mode)
make docker-down     # Stop all services
make docker-restart  # Restart all services
make docker-logs     # View logs from all services (follow mode)
make docker-clean    # Remove all containers, images, and volumes
```

## Manual Docker Commands

If you prefer using Docker Compose directly:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything
docker-compose down -v --rmi all
```

## Development Workflow

### 1. Start Services
```bash
make docker-up
```

### 2. View Logs
```bash
make docker-logs
```
Press `Ctrl+C` to exit log view (services keep running).

### 3. Make Code Changes
- Edit files in `client/src` or `server/src`
- Changes are automatically detected (hot reload)
- No need to rebuild containers

### 4. Stop Services
```bash
make docker-down
```

## Database Access

### Connect to MySQL

**From Host Machine:**
```bash
mysql -h 127.0.0.1 -P 3307 -u root -p
# Password: rootpassword
```

**From Server Container:**
```bash
docker exec -it alkhidmat-server sh
mysql -h db -u root -p
# Password: rootpassword
```

### Run Migrations

Migrations run automatically when the server starts. To run manually:

```bash
docker exec -it alkhidmat-server npx prisma migrate deploy
```

### Seed Database

```bash
docker exec -it alkhidmat-server npx prisma db seed
```

## Configuration

### Environment Variables

The project includes pre-configured `.env.docker` files that are committed to the repository:

**server/.env.docker:**
```env
DATABASE_URL="mysql://root:rootpassword@db:3306/alkhidmat360"
PORT=5000
NODE_ENV=development
SESSION_SECRET="docker-secret-key-change-in-production"
SESSION_NAME="alkhidmat_sid"
CORS_ORIGIN="http://localhost:5173"
```

**client/.env.docker:**
```env
VITE_API_URL="http://localhost:5000/api"
```

**Database (docker-compose.yml):**
- `MYSQL_ROOT_PASSWORD`: rootpassword
- `MYSQL_DATABASE`: alkhidmat360

**Note:** These are development credentials. For production, update these values.

### Custom Configuration

To override defaults, create a `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  db:
    environment:
      MYSQL_ROOT_PASSWORD: your_password

  server:
    environment:
      SESSION_SECRET: your_secret_key
```

## Troubleshooting

### Port Conflicts

If ports are already in use, edit `docker-compose.yml`:

```yaml
services:
  db:
    ports:
      - "3308:3306"  # Change 3307 to 3308

  server:
    ports:
      - "5001:5000"  # Change 5000 to 5001

  client:
    ports:
      - "5174:5173"  # Change 5173 to 5174
```

### Database Connection Issues

Check if MySQL is healthy:
```bash
docker ps  # Look for "healthy" status
docker logs alkhidmat-db
```

### Container Won't Start

View logs:
```bash
docker logs alkhidmat-server
docker logs alkhidmat-client
docker logs alkhidmat-db
```

### Reset Everything

Clean all Docker resources and start fresh:
```bash
make docker-clean
make docker-up
```

## Volumes

### Persistent Data

- **mysql_data**: Stores database data (persists between restarts)

### Development Volumes

- `./server/src:/app/src`: Server code (hot reload)
- `./server/prisma:/app/prisma`: Prisma schema
- `./client/src:/app/src`: Client code (hot reload)
- `./client/public:/app/public`: Static assets

## Network

All services communicate via `alkhidmat-network`:

- **Server → Database**: Uses hostname `db`
- **Client → Server**: Uses hostname from browser (localhost:5000)

## Production Considerations

This Docker setup is optimized for **development**. For production:

1. **Build optimized images**:
   - Use multi-stage builds
   - Run `npm run build` for client
   - Serve client with nginx

2. **Use production environment variables**:
   - Secure `SESSION_SECRET`
   - Configure proper `CORS_ORIGIN`
   - Set `NODE_ENV=production`

3. **Use Docker secrets** for sensitive data

4. **Enable SSL/TLS** for HTTPS

5. **Use managed database** (AWS RDS, etc.)

6. **Add reverse proxy** (nginx, Traefik)

## Health Checks

### Database Health Check
```bash
docker inspect alkhidmat-db --format='{{.State.Health.Status}}'
```

### Server Health Check
```bash
curl http://localhost:5000
```

### Check All Services
```bash
docker-compose ps
```

## Useful Commands

```bash
# Enter server container shell
docker exec -it alkhidmat-server sh

# Enter client container shell
docker exec -it alkhidmat-client sh

# Enter database container shell
docker exec -it alkhidmat-db sh

# View resource usage
docker stats

# Remove specific service
docker-compose rm -s -v server

# Rebuild specific service
docker-compose up -d --build server
```

## Comparison: Local vs Docker

| Feature | Local Dev | Docker Dev |
|---------|-----------|------------|
| Setup Time | ~5 mins | ~2 mins |
| Dependencies | Node, MySQL locally | Only Docker |
| Isolation | System-wide | Containerized |
| Port Conflicts | More likely | Less likely |
| Resource Usage | Lower | Moderate |
| Consistency | Varies by system | Same everywhere |

## Next Steps

- Customize `docker-compose.yml` for your needs
- Add more services (Redis, Nginx, etc.)
- Create production `Dockerfile.prod`
- Set up CI/CD with Docker
- Deploy to cloud (AWS, GCP, Azure)

## Support

For issues with Docker setup, check:
1. Docker logs: `make docker-logs`
2. Container status: `docker ps -a`
3. Network issues: `docker network inspect alkhidmat-network`
