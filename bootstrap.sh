#!/usr/bin/env bash
# Bootstrap the PMO dashboard repo.
# Run from inside the cloned repo, with the five provided files sitting in ./incoming/
#
#   git clone https://github.com/NourWaleed17/PMO-.git
#   cd PMO-
#   mkdir incoming && cp ~/Downloads/{CLAUDE.md,BRIEF.md,README.md,seed.json,verify.ts} incoming/
#   cp ~/Downloads/engine.ts incoming/
#   bash bootstrap.sh

set -euo pipefail

if [ ! -d incoming ]; then
  echo "Put the six provided files in ./incoming/ first. See header." >&2
  exit 1
fi

echo "==> Scaffolding Vite + React + TypeScript"
npm create vite@latest . -- --template react-ts

echo "==> Installing dependencies"
npm install
npm install recharts zod
npm install -D tailwindcss @tailwindcss/vite vitest tsx

echo "==> Creating directory structure"
mkdir -p docs src/engine src/data src/components src/lib

echo "==> Placing provided files"
mv incoming/CLAUDE.md   ./CLAUDE.md
mv incoming/BRIEF.md    docs/BRIEF.md
mv incoming/README.md   docs/MODEL.md
mv incoming/engine.ts   src/engine/engine.ts
mv incoming/seed.json   src/data/seed.json
mv incoming/verify.ts   ./verify.ts
rmdir incoming

echo "==> Pointing verify.ts at the new paths"
sed -i.bak 's#"./src/engine"#"./src/engine/engine"#; s#"seed.json"#"src/data/seed.json"#' verify.ts
rm -f verify.ts.bak

echo "==> Adding npm scripts"
node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync("package.json", "utf8"));
p.scripts = { ...p.scripts, verify: "tsx verify.ts", test: "vitest run" };
fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n");
'

echo "==> Verifying the model reproduces known-good totals"
npm run verify

cat > .gitignore <<'EOF'
node_modules
dist
.DS_Store
*.local
.env
.env.*
EOF

echo
echo "Done. Next:"
echo "  git add -A && git commit -m 'Phase 0: cost model, engine, brief' && git push"
echo "  claude    # then paste the Session 1 prompt"
