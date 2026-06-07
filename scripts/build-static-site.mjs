import { cpSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const src = resolve(root, 'static-site');
const dist = resolve(root, 'dist');
if (!existsSync(src)) { throw new Error('static-site directory is missing'); }
rmSync(dist, { recursive: true, force: true });
cpSync(src, dist, { recursive: true });
console.log('Static SayUpAI site copied to dist');
