# Scripts

This directory contains utility scripts for database initialization and data seeding.

## Available Scripts

### Create Admin User
Creates an admin user for the blog system.

```bash
npm run create-admin
```

**Environment variables required:**
- `ADMIN_USERNAME` - Admin username
- `ADMIN_EMAIL` - Admin email address
- `ADMIN_PASSWORD` - Admin password
- `ADMIN_FULLNAME` - Admin full name
- `ADMIN_BIO` - Admin bio/description

### Create Sample Categories
Populates the database with sample categories for blog posts.

```bash
npm run create-sample-categories
```

This script creates 15 sample categories including:
- Technology
- Web Development
- JavaScript
- React
- Node.js
- Database
- DevOps
- Mobile Development
- UI/UX Design
- Career
- Tutorials
- Tips & Tricks
- Open Source
- Personal
- Reviews

**Note:** The script will skip creation if categories already exist to avoid duplicates.

## Direct Execution

You can also run the scripts directly:

```bash
node scripts/createAdmin.js
node scripts/createSampleCategories.js
```

## Environment Setup

Make sure to set up your `.env` file with the required environment variables before running these scripts. See `env.example` for reference.
