import { rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");

const pathsToRemove = [
  "src-tauri/target",
  ".nuxt",
  ".output",
  "applyflow.db",
].map((pathToRemove) => resolve(projectRoot, pathToRemove));

class DevClearScriptError extends Error {
  constructor(message) {
    super(message);
    this.name = "DevClearScriptError";
  }
}

async function removePath(pathToRemove) {
  const displayPath = relative(projectRoot, pathToRemove) || ".";

  try {
    await rm(pathToRemove, { recursive: true, force: true });
    console.log(`Removed ${displayPath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Skipped ${displayPath}: ${message}`);
  }
}

async function main() {
  for (const pathToRemove of pathsToRemove) {
    await removePath(pathToRemove);
  }

  const npmCliPath = process.env.npm_execpath;

  if (!npmCliPath) {
    throw new DevClearScriptError("npm_execpath is not available");
  }

  const result = spawnSync(
    process.execPath,
    [npmCliPath, "run", "db:seed", "--", "--mode=development"],
    {
      cwd: projectRoot,
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await main();