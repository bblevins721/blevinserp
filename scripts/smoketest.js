import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const port = 4500 + Math.floor(Math.random() * 500);
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['server.mjs'], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});

async function waitForServer() {
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) return;
    } catch {
      // The server may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Server did not become ready within 3 seconds.');
}

try {
  await waitForServer();

  const homepage = await fetch(`${baseUrl}/`);
  assert.equal(homepage.status, 200);
  assert.match(await homepage.text(), /BlevinsERP/);

  const stylesheet = await fetch(`${baseUrl}/styles.css`);
  assert.equal(stylesheet.status, 200);
  assert.match(stylesheet.headers.get('content-type'), /text\/css/);

  const privateFile = await fetch(`${baseUrl}/package.json`);
  assert.equal(privateFile.status, 404);

  const unsupportedMethod = await fetch(`${baseUrl}/`, { method: 'POST' });
  assert.equal(unsupportedMethod.status, 405);

  console.log('Smoke test passed: public assets, private-file rejection, and method guard are working.');
} finally {
  server.kill('SIGTERM');
}

