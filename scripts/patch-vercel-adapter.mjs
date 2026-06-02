import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapterPath = join(__dirname, '../node_modules/@astrojs/vercel/dist/serverless/adapter.js');

try {
  let content = readFileSync(adapterPath, 'utf8');
  // Replace fallback nodejs18.x with nodejs20.x
  const patched = content.replaceAll("return 'nodejs18.x'", "return 'nodejs20.x'");
  if (patched === content) {
    console.log('Vercel adapter already patched or pattern not found.');
  } else {
    writeFileSync(adapterPath, patched);
    console.log('Patched @astrojs/vercel adapter: nodejs18.x → nodejs20.x');
  }
} catch (e) {
  console.error('Patch failed:', e.message);
}
