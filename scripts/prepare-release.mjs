import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const version = process.argv[2];

if (!version) {
  console.error("Usage: pnpm release:create <version>");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Invalid semver version: ${version}`);
  process.exit(1);
}

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

const filesToStage = ["package.json", "pnpm-lock.yaml", "README.md", "public/_locales/en/messages.json"].filter(
  existsSync,
);

run("pnpm", ["version", version, "--no-git-tag-version"]);
run("git", ["add", ...filesToStage]);
run("git", ["commit", "-m", `chore: release v${version}`]);
run("git", ["tag", `v${version}`]);
