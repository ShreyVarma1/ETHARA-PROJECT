# Team Task Manager

A full-stack, premium task management application for teams. Built as an assignment.

## Features
- **Role-Based Access Control:** Admin vs Member roles.
- **Project Management:** Admins can create projects and view all team projects.
- **Task Assignment & Kanban:** Admins can assign tasks to members, members can move tasks across To Do, In Progress, and Completed.
- **Dashboard Metrics:** Track progress at a glance.
- **Premium UI:** Dark-mode optimized, fully responsive, dynamic CSS.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** Prisma ORM + PostgreSQL/SQLite
- **Auth:** NextAuth.js (Credentials, JWT)
- **Styling:** Vanilla CSS (Modern Variables, Flexbox, Grid)

## Local Development
1. Clone the repository.
2. Run `npm install`.
3. Set up your `.env` file (you can copy `.env.example` if available, or generate a Prisma SQLite DB via `npx prisma db push`).
4. `npm run dev` to start the server.

## Railway Deployment Instructions
1. Push this repository to a new empty GitHub repository.
2. Go to [Railway](https://railway.app/).
3. Create a **New Project** -> **Deploy from GitHub repo**.
4. Select your repository.
5. Add a **PostgreSQL Database** from Railway's plugin menu to the project.
6. In your application's Railway Settings -> **Variables**, add:
   - `DATABASE_URL` (value provided by the Railway Postgres plugin, change `?schema=public` to `?pgbouncer=true` if required).
   - `NEXTAUTH_SECRET` (generate a random string, e.g., using `openssl rand -base64 32`).
   - `NEXTAUTH_URL` (your deployed railway URL, e.g., `https://my-app.up.railway.app`).
7. Go to **Deployments** -> wait for the build to finish. Railway automatically detects Next.js.
8. Before the first run, make sure Prisma uses the correct provider. *Note:* If you are using PostgreSQL in production, update `prisma/schema.prisma` provider to `"postgresql"`. This repository defaults to SQLite for local ease, so for Railway, either use a Railway volume for SQLite, OR just update the schema provider to `postgresql` before pushing.

### Switching from SQLite to Postgres for Railway:
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
And push the change!
