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

const bootstrapEnabled = process.env.RUN_DATABASE_BOOTSTRAP === "true";
const hostedDeployment = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

if (hostedDeployment || bootstrapEnabled) {
  console.log("Applying committed database migrations.");
  runScript("prisma:deploy");
}

if (bootstrapEnabled) {
  console.log("One-time database bootstrap enabled: adding the required BRW seed data.");
  runScript("prisma:seed");
}

runScript("prisma:generate");
runScript("next:build");
