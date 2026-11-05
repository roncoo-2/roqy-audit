---
name: third-party-intake
version: "1.0.0"
description: "Use when adopting a third-party repo, library, tool or agent skill. Scores supply-chain risk before it enters your system."
author: roqy.io
license: MIT
metadata:
  hermes:
    tags: [supply-chain, audit, devops, security]
    related_skills: [infra-readiness-audit, live-infra-audit]
---

# Third-Party Intake

Vet an external repo/package/tool BEFORE it enters your system. Read-only.
Output: a 0-100 trust score, red flags, and one of three verdicts:
ADOPT / ADOPT-WITH-GUARDS / SKIP.

## Hard rules

1. Read-only: clone shallow, run scanners, query public APIs. Never execute
   the project's install scripts, postinstall hooks, or binaries.
2. Never print secret values found in the audited repo. 4 chars max.
3. The score formula is fixed so scores are comparable across projects.

## The seven layers (run in order, one batched call per layer)

### L1: Project health
```
gh api repos/OWNER/REPO --jq '{created:.created_at,pushed:.pushed_at,stars:.stargazers_count,open_issues:.open_issues_count,license:.license.spdx_id}'
gh api repos/OWNER/REPO/commits --jq 'length'   # recent activity
gh api repos/OWNER/REPO/contributors --jq 'length'
```
Red flags: last push > 6 months ago, < 2 contributors with recent commits,
open security issues unanswered > 90 days.

### L2: Secrets and history
```
git clone --no-checkout <url> && cd repo && git log -p | gitleaks detect --no-git -  # or: gitleaks detect (full history)
```
Red flags: live secrets ever committed and not rotated; secrets in current HEAD.
Positive signal: past leak that was rotated within days (they respond).

### L3: CI hygiene
```
grep -rE 'uses:.*@(v[0-9]+|main|master)' .github/workflows/   # mutable refs
grep -rn 'pull_request_target' .github/workflows/
grep -rn 'id-token' .github/workflows/                        # trace to auth target
```
Same checks as infra-readiness-audit. Red flags: mutable refs on release
workflows, pull_request_target with PR-head checkout, secrets printed to logs.

### L4: Dependency health
```
osv-scanner --lockfile <lock>     # or trivy fs --scanners vuln
```
Red flags: critical CVEs unpatched > 90 days, dependencies on abandoned
packages, postinstall scripts in package.json that fetch from the network.

### L5: Provenance
```
gh release list --limit 5                      # real releases with notes?
cosign verify <artifact> 2>/dev/null           # signed artifacts?
npm view <pkg> repository.url                  # npm package links to the repo?
```
Red flags: npm package whose repository URL differs from the repo you are
vetting; no releases (only branch installs); unsigned critical artifacts.

### L6: License
MIT / Apache-2.0 / BSD = green. LGPL = check linking. GPL/AGPL = flag for
commercial products. No license file = red flag (default copyright, you may
not legally use it).

### L7: Version diff (for upgrades of already-adopted deps)
```
git log --oneline v1.2.0..v1.3.0
git diff v1.2.0..v1.3.0 -- '*.js' '*.py' | grep -E 'exec|eval|subprocess|curl|http'
```
Review only the diff. Red flags: new network calls, new exec, obfuscated code,
maintainer change between versions (account takeover pattern).

## Scoring (fixed formula)

Start at 100. Deductions:
- L1: -20 abandoned (>6mo), -10 bus factor 1, -5 stale security issues
- L2: -30 live unrotated secrets, -10 historical secrets (rotated: -0)
- L3: -15 mutable refs on release path, -15 pull_request_target risk, -10 broad permissions
- L4: -10 per unpatched critical CVE, -5 per abandoned dependency
- L5: -15 no releases / provenance mismatch, -5 unsigned
- L6: -25 GPL in commercial use, -40 no license
- L7: -20 suspicious diff on upgrade

Verdicts: >= 80 ADOPT · 50-79 ADOPT-WITH-GUARDS (pin SHA, mirror, monitor) ·
< 50 SKIP.

## Report format

```
# Intake: <name> (<repo>)
Score: <n>/100 — <ADOPT | ADOPT-WITH-GUARDS | SKIP>
Layer scores: L1 n | L2 n | L3 n | L4 n | L5 n | L6 n | L7 n/a
Red flags: <list>
Guards if adopted: <pin SHA x.y.z, add to Dependabot, review at 90 days>
```

## Update mode (before every dependency/skill upgrade)

Trigger: "intake update <name> <from> <to>". Runs L7 plus the delta checks
below. Verdicts: UPGRADE / UPGRADE-WITH-PIN / HOLD.

1. Diff review: `git log --oneline v<from>..v<to>` — every commit read at
   title level; anything touching auth, network, exec, or build gets a full
   diff read. Red flag: commits like "misc fixes" touching auth code.
2. New CVEs: osv-scanner on the new version's lockfile vs the old. A new
   version that INTRODUCES a CVE is a HOLD until assessed.
3. Maintainer change: `gh api repos/OWNER/REPO/contributors` before/after —
   a new top committer between versions is the account-takeover pattern
   (tj-actions 2025). Red flag: release published by a never-seen-before
   account.
4. License change: compare LICENSE between versions. MIT->AGPL on a
   commercial product = SKIP the upgrade.
5. New install-time code: diff of package.json / setup.py / install scripts.
   New postinstall or setup hooks = full review before upgrade.
6. Breaking-change scan: CHANGELOG + semver. Major bump without changelog
   entry = red flag.
7. Blast radius for us: grep our code for the APIs the new version changed.
   If we use none of the changed surfaces, the upgrade risk drops a level.

Decision rules:
- UPGRADE: diff clean, no new CVEs, same maintainers, license unchanged.
- UPGRADE-WITH-PIN: minor red flags (unsigned release, one suspicious commit
  explained) — upgrade but pin the exact SHA and re-run intake in 30 days.
- HOLD: new CVE, maintainer takeover pattern, license change, or unexplained
  auth/exec changes. Stay on the old version; re-evaluate next release.

## Integration

- Run before adding any dependency, tool, or agent skill to a production system.
- For agent skills specifically: also run the md-agent-safety scan (prompt
  injection patterns) on every markdown file in the skill.
- Store the report next to the adoption PR so the decision is auditable.
