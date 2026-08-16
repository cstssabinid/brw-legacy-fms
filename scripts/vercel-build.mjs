import { spawnSync } from "node:child_process";

const npmCliPath = process.env.npm_execpath;
if (!npmCliPath) throw new Error("Run this build through npm so npm_execpath is available.");

function runScript(name) {
  const result = spawnSync(process.execPath, [npmCliPath, "run", name], {
    env: process.env,
    stdio: "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.RUN_DATABASE_BOOTSTRAP === "true") {
  console.log("One-time database bootstrap enabled: applying the Prisma schema and required BRW seed data.");
  runScript("db:bootstrap");
}

runScript("build");
