import { authClient } from '@/core/auth/client';

function parseArg(name: string) {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : '';
}

async function main() {
  const email = parseArg('email');
  const password = parseArg('password');
  const name = parseArg('name') || email.split('@')[0] || 'user';

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/create-user.ts --email=<email> --password=<password> [--name=<name>]');
    process.exit(1);
  }

  await authClient.signUp.email({ email, password, name });
  console.log(`User created: ${email}`);
}

main().catch((e) => {
  console.error('Create user failed:', e);
  process.exit(1);
});

