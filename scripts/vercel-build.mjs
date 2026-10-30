import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const npmCliPath = process.env.npm_execpath;
if (!npmCliPath) throw new Error("Run this build through npm so npm_execpath is available.");

function runScript(name) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npmCliPath, "run", name], {
      env: process.env,
      stdio: ["inherit", "pipe", "pipe"]
    });
    let output = "";

    for (const streamName of ["stdout", "stderr"]) {
      child[streamName].on("data", (chunk) => {
        output += chunk.toString();
        process[streamName].write(chunk);
      });
    }

    child.once("error", reject);
    child.once("close", (code) => resolve({ code, output }));
  });
}

async function runMigrationDeploy() {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await runScript("prisma:deploy");
    if (result.code === 0) return;

    const advisoryLockTimeout = result.output.includes("P1002")
      && /advisory lock/i.test(result.output);
    if (!advisoryLockTimeout || attempt === maxAttempts) {
      process.exit(result.code ?? 1);
    }

    const waitSeconds = attempt * 5;
    console.warn(
      `Prisma migration lock is busy; retrying in ${waitSeconds}s (${attempt + 1}/${maxAttempts}).`
    );
    await delay(waitSeconds * 1000);
  }
}

const bootstrapEnabled = process.env.RUN_DATABASE_BOOTSTRAP === "true";
const hostedDeployment = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

async function main() {
  if (hostedDeployment || bootstrapEnabled) {
    console.log("Applying committed database migrations.");
    await runMigrationDeploy();
  }

  if (bootstrapEnabled) {
    console.log("One-time database bootstrap enabled: adding the required BRW seed data.");
    const result = await runScript("prisma:seed");
    if (result.code !== 0) process.exit(result.code ?? 1);
  }

  const generateResult = await runScript("prisma:generate");
  if (generateResult.code !== 0) process.exit(generateResult.code ?? 1);

  const buildResult = await runScript("next:build");
  if (buildResult.code !== 0) process.exit(buildResult.code ?? 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
