process.env.DATABASE_URL = "file:./dev.db";
const { execSync } = require('child_process');
execSync('npx prisma db push', { stdio: 'inherit' });
execSync('npx prisma generate', { stdio: 'inherit' });
