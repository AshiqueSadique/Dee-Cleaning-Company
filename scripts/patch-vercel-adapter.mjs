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

// Patch 2: Add fluid compute support to .vc-config.json post-build
const vcConfigPath = join(__dirname, '../.vercel/output/functions/_render.func/.vc-config.json');
if (existsSync(vcConfigPath)) {
  try {
    const config = JSON.parse(readFileSync(vcConfigPath, 'utf8'));
    // Fluid compute requires these fields
    if (!config.operationType) {
      config.operationType = 'Page';
      writeFileSync(vcConfigPath, JSON.stringify(config, null, '\t'));
      console.log('Patched .vc-config.json: added operationType=Page for fluid compute');
    } else {
      console.log('.vc-config.json already patched.');
    }
  } catch (e) {
    console.error('vc-config patch failed:', e.message);
  }
}
