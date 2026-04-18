# Alkhidmat 360

A comprehensive charity management platform for donations, applications, and volunteer coordination.

## Features

- **Multi-User System**: Donors, Beneficiaries, Volunteers, and Admins
- **Donation Management**: Qurbani, Ration, Skin Collection, Orphan Sponsorship
- **Application System**: Loan Applications, Ramadan Ration, Orphan Registration
- **Volunteer Management**: Task registration and coordination
- **Session-Based Authentication**: Secure login with persistent sessions
- **Dashboard Analytics**: Real-time statistics and counts

## Tech Stack

**Frontend:**
- React 18 + Vite
- React Router v6
- Zustand (State Management)
- TailwindCSS
- Lucide Icons
- Axios

**Backend:**
- Node.js + Express
- Prisma ORM
- MySQL
- Express Session
- Bcrypt

## Quick Start

### Option 1: Docker (Recommended - Easiest)

**Prerequisites:** Docker & Docker Compose

```bash
# 1. Clone the repository
git clone <repository-url>
cd alkhidmat360

# 2. Start everything with Docker (one command!)
make docker-up
```

That's it! The app will be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- MySQL: localhost:3307

**Test Credentials (auto-seeded):**
- Admin: admin@alkhidmat360.com / admin123
- Donor: donor@test.com / donor123
- Beneficiary: beneficiary@test.com / beneficiary123
- Volunteer: volunteer@test.com / volunteer123

View logs: `make docker-logs`
Stop services: `make docker-down`

📘 **[Full Docker Guide](DOCKER.md)**

### Option 2: Local Development

**Prerequisites:** Node.js (v18+), MySQL (v8+), Make (optional)

```bash
# 1. Clone the repository
git clone <repository-url>
cd alkhidmat360

# 2. Complete setup (installs dependencies + sets up database)
make setup

# 3. Start development servers
make dev
```

The app will be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Manual Setup (without Make)

If you don't have Make installed:

```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Setup database
cd server
npx prisma migrate deploy
npx prisma generate
cd ..

# Start development
npm run dev
```

## Configuration

### Database Setup

1. Create a MySQL database named `alkhidmat360`
2. Update `server/.env` with your database credentials:

```env
DATABASE_URL="mysql://root:your_password@localhost:3306/alkhidmat360"
SESSION_SECRET="your-secret-key"
SESSION_NAME="alkhidmat_sid"
NODE_ENV="development"
PORT=5000
CORS_ORIGIN="http://localhost:5173"
```

### Default Test Accounts

After running migrations, you can create test users:

- **Admin**: admin@alkhidmat360.com / password123
- **Donor**: donor@test.com / password123
- **Beneficiary**: beneficiary@test.com / password123
- **Volunteer**: volunteer@test.com / password123

## Available Make Commands

### Local Development
```bash
make help          # Show all available commands
make install       # Install all dependencies
make setup         # Complete setup (install + database)
make dev           # Start development servers
make db-setup      # Setup database (run migrations)
make db-migrate    # Create new migration
make db-seed       # Seed database with initial data
make db-reset      # Reset database (WARNING: deletes all data)
make clean         # Clean node_modules and build artifacts
```

### Docker Commands
```bash
make docker-build  # Build all Docker images
make docker-up     # Start all services with Docker
make docker-down   # Stop all Docker services
make docker-restart# Restart all services
make docker-logs   # View logs from all services
make docker-clean  # Remove all Docker resources (WARNING: deletes everything)
```

## Project Structure

```
alkhidmat360/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── store/         # Zustand state management
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── validators/    # Input validation
│   │   └── utils/         # Utility functions
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── Makefile               # Project automation
└── package.json           # Root package.json
```

## Development

### Running the App

```bash
# Start both client and server
make dev

# Or manually
npm run dev
```

### Database Migrations

```bash
# Create a new migration
make db-migrate

# Apply existing migrations
make db-setup

# Reset database (removes all data)
make db-reset
```

## Bug Fixes (Latest)

### Session Persistence
- ✅ Fixed session table name mismatch (Sessions vs sessions)
- ✅ Added userType to session data
- ✅ Added explicit session.save() before response

### Dashboard Statistics
- ✅ Added rejected count to dashboard stats
- ✅ Fixed beneficiary application counts display

### Page Refresh Authentication
- ✅ Fixed React timing issue causing premature redirects
- ✅ Set initial loading state to true in Zustand store
- ✅ Clear loading state on login/signup pages

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub.
