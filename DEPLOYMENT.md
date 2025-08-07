# Deployment Instructions

## Vercel Deployment

This project is configured to deploy on Vercel with the following setup:

### 1. Environment Variables
Make sure to set up these environment variables in your Vercel dashboard:
- `DATABASE_URL` - Your PostgreSQL database connection string

### 2. Database Migrations
Database migrations are NOT run automatically during build to avoid the schema engine binary issues in Vercel's build environment.

**After deploying, run migrations manually:**

#### Option 1: Using Vercel CLI
```bash
vercel env pull .env.production
bun run db:migrate
```

#### Option 2: Run migrations locally against production database
```bash
# Set your production DATABASE_URL in .env
bunx prisma migrate deploy
```

#### Option 3: Use Prisma Cloud Platform
Consider using Prisma Accelerate or Prisma Pulse for automatic migrations in production.

### 3. Build Configuration
The project uses:
- `bunx prisma generate` during build (no migrations)
- Binary targets include `rhel-openssl-3.0.x` for Vercel compatibility
- `PRISMA_CLIENT_ENGINE_TYPE=library` for serverless optimization

### 4. Files Modified for Vercel Compatibility
- `prisma/schema.prisma` - Added binary targets
- `package.json` - Updated scripts for Bun and separated migration
- `vercel.json` - Added engine configuration and install command
- `next.config.ts` - Updated for Next.js 15 compatibility
- All imports changed from custom output to `@prisma/client`

### Troubleshooting
If you encounter Prisma-related errors:
1. Ensure `DATABASE_URL` is correctly set
2. Run migrations manually after deployment
3. Check that binary targets are correctly specified
4. Verify Prisma client generation in build logs
