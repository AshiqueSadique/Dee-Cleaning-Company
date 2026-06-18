import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapterPath = join(__dirname, '../node_modules/@astrojs/vercel/dist/serverless/adapter.js');

// Patch 1: Fix nodejs18.x fallback -> nodejs20.x
try {
  let content = readFileSync(adapterPath, 'utf8');
  const patched = content.replaceAll("return 'nodejs18.x'", "return 'nodejs20.x'");
  if (patched !== content) {
    writeFileSync(adapterPath, patched);
    console.log('Patched @astrojs/vercel adapter: nodejs18.x → nodejs20.x');
  }
} catch (e) {
  // Adapter may not exist yet (pre-install)
}

