#!/usr/bin/env node
// Generates a bcrypt hash for AUTH_PASSWORD_HASH.
// Usage: node scripts/hash-password.mjs "your-password"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
console.error(
  "\nIf you're putting this in a local .env file, escape every '$' as '\\$' " +
    "(Next.js's env loader otherwise mangles it). Pasting it directly into " +
    "Railway's dashboard needs no escaping."
);
