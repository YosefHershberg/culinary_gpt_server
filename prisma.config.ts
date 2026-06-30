import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Only the Prisma CLI (migrate / db push / studio) reads this — the runtime
    // client uses the PrismaPg adapter with DATABASE_URL (see src/config/prisma.ts).
    // Migrations need the DIRECT (non-pooled) connection; fall back to DATABASE_URL.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
