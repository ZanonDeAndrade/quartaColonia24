import bcrypt from 'bcryptjs';

const run = async () => {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx ts-node scripts/generate-admin-hash.ts <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
};

void run();
