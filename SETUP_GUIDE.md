# Embassy System - Setup Guide

## 🎯 Overview

Your Embassy System API is now fully configured with:
- ✅ **Prisma ORM** connected to Neon PostgreSQL (Serverless)
- ✅ **JWT Authentication** with access and refresh tokens (24h expiration)
- ✅ **Global API Protection** - All endpoints require authentication
- ✅ **Beautiful Login Page** at root route
- ✅ **Super Admin Account** seeded and ready to use

---

## 📋 Prerequisites

Before you begin, ensure you have:
1. ✅ Neon account with database created (https://neon.tech)
2. ✅ Database connection string from Neon
3. ✅ Node.js and npm installed
4. ✅ All dependencies installed (`npm install`)

---

## 🚀 Setup Steps

### Step 1: Configure Database Connection

The `.env` file is already configured with Neon database connection:

```bash
# Pooled connection (used by the application)
DATABASE_URL="postgresql://neondb_owner:npg_oxTAvtPf0CR5@ep-broad-mud-aduol0ua-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Direct connection (used for migrations)
DIRECT_URL="postgresql://neondb_owner:npg_oxTAvtPf0CR5@ep-broad-mud-aduol0ua.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**To get your Neon connection string:**
1. Go to your Neon dashboard (https://console.neon.tech)
2. Select your project
3. Navigate to Connection Details
4. Copy both the pooled and direct connection strings

---

### Step 2: Run Database Migration

Create all database tables in Neon:

```bash
npm run prisma:migrate
```

This will:
- Create all tables (users, embassies, events, publications, tasks, staff, chatrooms, emails, notifications)
- Set up relationships and indexes
- Generate the Prisma Client

**Expected output:**
```
✔ Generated Prisma Client
✔ The migration has been created successfully
```

---

### Step 3: Seed the Super User

Create the super admin account:

```bash
npm run prisma:seed
```

This will create:
- **Super User Email:** `embassysuper@email.com`
- **Super User Password:** `embassysuper123`
- **Role:** `super_admin`
- **Sample Embassy:** Main Embassy (Kampala, Uganda)

**Expected output:**
```
Seeding database...
Super user created: embassysuper@email.com
Sample embassy created: Main Embassy
✅ Seeding completed successfully!
```

---

### Step 4: Start the Application

Start the development server:

```bash
npm run start:dev
```

**Expected output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] PrismaModule dependencies initialized
[Nest] INFO [InstanceLoader] AuthModule dependencies initialized
[Nest] INFO Application is running on: http://localhost:3000
```

---

### Step 5: Login and Access Swagger

1. **Open your browser** and navigate to: `http://localhost:3000/`

2. **You'll see the login page** with a beautiful gradient background

3. **Enter the super user credentials:**
   - Email: `embassysuper@email.com`
   - Password: `embassysuper123`

4. **Click "Sign In"**

5. **You'll be automatically redirected** to the Swagger API documentation at: `http://localhost:3000/api`

---

## 🔐 Authentication Guide

### How Authentication Works

1. **Login Flow:**
   ```
   User enters credentials → POST /auth/login → Returns access_token & refresh_token
   → Tokens stored in localStorage → Redirect to Swagger docs
   ```

2. **Using the API:**
   - All API endpoints (except login) require authentication
   - Include the access token in the `Authorization` header:
     ```
     Authorization: Bearer <your_access_token>
     ```

3. **Token Expiration:**
   - **Access Token:** Expires after **24 hours**
   - **Refresh Token:** Expires after **7 days**

4. **Refreshing Tokens:**
   ```bash
   POST /auth/refresh
   Body: { "refresh_token": "your_refresh_token" }
   ```

### Using Swagger with Authentication

1. **After login**, you're redirected to Swagger docs
2. **Click the "Authorize" button** (🔓 icon) at the top right
3. **Enter your token** in the format:
   ```
   Bearer <paste_your_access_token_here>
   ```
4. **Click "Authorize"**
5. Now you can **test all protected endpoints** directly from Swagger!

---

## 📊 Database Schema

Your database includes the following tables:

### Core Tables
- **users** - User accounts with authentication
- **embassies** - Embassy locations and details
- **staff** - Embassy staff members (linked to users)

### Operations
- **events** - Embassy events and activities
- **publications** - Published content and announcements
- **tasks** - Task management and assignments

### Communications
- **chatrooms** - Chat room definitions
- **chatroom_members** - Chat room membership
- **chat_messages** - Chat messages with attachments
- **emails** - Email system (draft, sent, archived, scheduled)
- **email_recipients** - Email recipients with read status
- **notifications** - User notifications

---

## 🛠️ Useful Commands

### Prisma Commands
```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Run seed script
npm run prisma:seed
```

### Development Commands
```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run linting
npm run lint
```

---

## 🔑 API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /` - Login page
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token

### Protected Endpoints (Authentication Required)

#### Authentication
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

#### Events
- `GET /events` - List events (filterable, paginated to 25)
- `POST /events` - Create event
- `GET /events/stats` - Event statistics
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

#### Publications
- `GET /publications` - List publications (paginated to 25)
- `POST /publications` - Create publication
- `PATCH /publications/:id/publish` - Publish publication
- `PATCH /publications/:id/archive` - Archive publication
- `GET /publications/stats/summary` - Publication statistics

#### Tasks
- `GET /tasks` - List tasks (paginated to 25)
- `POST /tasks` - Create task
- `PATCH /tasks/:id/status/pending` - Mark as pending
- `PATCH /tasks/:id/status/in-progress` - Mark as in progress
- `PATCH /tasks/:id/status/completed` - Mark as completed
- `PATCH /tasks/:id/priority/{low|medium|high}` - Set priority

#### Staff
- `GET /staff` - List staff (paginated to 25)
- `POST /staff` - Create staff member
- `PATCH /staff/:id/activate` - Activate staff
- `PATCH /staff/:id/deactivate` - Deactivate staff
- `PATCH /staff/:id/transfer` - Transfer to another embassy

#### Messages
- `POST /messages/chatrooms` - Create chatroom
- `GET /messages/chatrooms` - List chatrooms
- `POST /messages/chatrooms/:id/messages` - Send message
- `GET /messages/emails/inbox` - Get inbox
- `POST /messages/emails` - Send email
- `GET /messages/notifications` - Get notifications
- `GET /messages/stats/summary` - Messaging statistics

---

## 🌐 WebSocket (Real-time Chat)

Connect to: `ws://localhost:3000/messages`

### Events to Emit (Client → Server)
- `register` - Register user for real-time updates
- `join_chatroom` - Join a chatroom
- `send_message` - Send a message
- `typing` - Send typing indicator

### Events to Listen (Server → Client)
- `new_message` - New message received
- `new_notification` - New notification
- `user_joined` - User joined chatroom
- `user_typing` - User is typing

---

## 🔒 Security Features

- ✅ **Bcrypt password hashing** (10 rounds)
- ✅ **JWT tokens** with expiration
- ✅ **Refresh token rotation** on refresh
- ✅ **Global authentication guard** protecting all endpoints
- ✅ **@Public decorator** for selective public endpoints
- ✅ **Token invalidation** on logout
- ✅ **Active user check** on every request

---

## 📝 Environment Variables

Your `.env` file contains:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://kkyieexadqrqaftckeoc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# Database Connection
DATABASE_URL="postgresql://postgres:PASSWORD@db...supabase.co:5432/postgres"

# JWT Secrets (Change in production!)
JWT_ACCESS_SECRET="embassy-super-secret-access-key-2025-change-in-production"
JWT_REFRESH_SECRET="embassy-super-secret-refresh-key-2025-change-in-production"
JWT_ACCESS_EXPIRATION="24h"
JWT_REFRESH_EXPIRATION="7d"
```

**⚠️ IMPORTANT:** Change the JWT secrets in production!

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Check your DATABASE_URL in `.env` - make sure the password is correct

### Issue: "JWT secrets are not configured"
**Solution:** Verify `.env` file has JWT_ACCESS_SECRET and JWT_REFRESH_SECRET

### Issue: "User not found" after login
**Solution:** Run `npm run prisma:seed` to create the super user

### Issue: "Unauthorized" on all API calls
**Solution:** Make sure you're including the Bearer token in the Authorization header

### Issue: Prisma migration fails
**Solution:**
1. Check your internet connection
2. Verify Supabase database is running
3. Check DATABASE_URL format is correct

---

## 🎉 Next Steps

Now that your system is set up:

1. ✅ **Test the login** at `http://localhost:3000/`
2. ✅ **Explore the API** in Swagger at `http://localhost:3000/api`
3. ✅ **Create test data** using the API endpoints
4. ✅ **Test real-time chat** with WebSocket client
5. ✅ **Update modules** to use Prisma instead of in-memory storage (if needed)

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT Best Practices](https://jwt.io/introduction)

---

**Need help?** Check the troubleshooting section or review the error logs for more details.

**Happy coding! 🚀**
