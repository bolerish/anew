import packageJson from "../package.json" with { type: "json" };

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const requestedVersion = process.argv[2];

function getNextPatchVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    console.error(`Cannot auto-increment non-standard version: ${version}`);
    process.exit(1);
  }

  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}`;
}

const version = requestedVersion ?? getNextPatchVersion(packageJson.version);

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Invalid semver version: ${version}`);
  process.exit(1);
}

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

const filesToStage = ["package.json", "pnpm-lock.yaml", "README.md", "public/_locales"].filter(existsSync);

run("pnpm", ["version", version, "--no-git-tag-version"]);
run("git", ["add", ...filesToStage]);
run("git", ["commit", "-m", `chore: release v${version}`]);
run("git", ["tag", `v${version}`]);
