const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../apps/web/dist');
const distDest = path.join(__dirname, '../dist');
const publicDest = path.join(__dirname, '../public');

if (fs.existsSync(src)) {
  fs.cpSync(src, distDest, { recursive: true });
  fs.cpSync(src, publicDest, { recursive: true });
  console.log('✓ Successfully copied build output to ./dist and ./public');
} else {
  console.error('✗ Build output directory does not exist:', src);
  process.exit(1);
}
