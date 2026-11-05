#!/usr/bin/env node
// roqy-audit setup: installs the read-only audit skills into detected agent dirs.
// Downloads from the official repo only. Shows what it will do, asks before writing.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, cpSync, rmSync, readFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const REPO = "https://github.com/roncoo-2/roqy-audit.git";
const SKILLS = ["infra-readiness-audit", "live-infra-audit"];

const targets = [
  { name: "Claude Code", dir: join(homedir(), ".claude", "skills") },
  { name: "Cursor", dir: join(homedir(), ".cursor", "skills") },
  { name: "Hermes", dir: join(homedir(), ".hermes", "skills") },
].filter((t) => existsSync(t.dir));

if (targets.length === 0) {
  console.log("No agent skill directories found (~/.claude/skills, ~/.cursor/skills, ~/.hermes/skills).");
  console.log("Create one and re-run, or pass a target: npx roqy-audit-setup <dir>");
  process.exit(1);
}

const args = process.argv.slice(2);
const yes = args.includes("--yes");
const custom = args.find((a) => a !== "--yes");
if (custom) targets.push({ name: "custom", dir: custom });

console.log("roqy-audit setup");
console.log("Source:", REPO, "(official repo, MIT)");
console.log("Skills:", SKILLS.join(", "));
console.log("Targets:");
for (const t of targets) console.log("  -", t.name, "->", t.dir);
if (!yes) {
  console.log("\nRun with --yes to install.");
  process.exit(0);
}

const tmp = join(tmpdir(), "roqy-audit-" + Date.now());
console.log("\nCloning (shallow)...");
execFileSync("git", ["clone", "--depth", "1", REPO, tmp], { stdio: "inherit" });

for (const t of targets) {
  mkdirSync(t.dir, { recursive: true });
  for (const s of SKILLS) {
    const dst = join(t.dir, s);
    if (existsSync(dst)) rmSync(dst, { recursive: true });
    cpSync(join(tmp, "skills", s), dst, { recursive: true });
    console.log("installed:", dst);
  }
}
rmSync(tmp, { recursive: true, force: true });

const ver = JSON.parse(readFileSync(new URL("../package.json", import.meta.url))).version;
console.log("\nDone (v" + ver + "). Next step, in your agent:");
console.log('  "Run the infra-readiness-audit skill on this repository, repo-only mode."');
console.log("Free audit = local files only, no cloud access. Live audit is the paid service: https://roqy.io");
