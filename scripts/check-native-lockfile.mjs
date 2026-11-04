import { readFileSync } from 'node:fs';

// npm may omit other platforms from a lock generated with node_modules present.
// Verify the complete native dependency set before relying on npm ci in Linux CI.
const { packages } = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const nativeParents = ['rolldown', '@tailwindcss/oxide', 'lightningcss', 'typescript'];
const missing = [];
let checked = 0;
for (const [path, entry] of Object.entries(packages)) {
  if (!nativeParents.some(name => path.endsWith(`node_modules/${name}`))) continue;
  for (const [name, version] of Object.entries(entry.optionalDependencies || {})) {
    checked++;
    const found = Object.entries(packages).some(([candidate, data]) => candidate.endsWith(`node_modules/${name}`) && data.version === version && data.integrity && data.resolved);
    if (!found) missing.push(`${name}@${version} (required by ${path})`);
  }
}
if (!checked || missing.length) {
  console.error('Native lockfile validation failed. Regenerate the root lock in a clean directory without node_modules.');
  for (const dependency of missing) console.error(`Missing: ${dependency}`);
  process.exitCode = 1;
} else console.log(`Validated ${checked} native optional dependencies for all declared platforms.`);
