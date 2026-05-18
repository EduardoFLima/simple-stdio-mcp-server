import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, unlink, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { decryptSopsFile } from '../src/sops.js';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const fixturesDir = resolve(process.cwd(), 'test/fixtures');
const inputFile = join(fixturesDir, 'secret.enc.yaml');
const outputFile = join(fixturesDir, 'secret.enc.decrypted.yaml');
const customOutput = join(fixturesDir, 'custom-output.yaml');

describe('decryptSopsFile', () => {
  beforeEach(async () => {
    await mkdir(fixturesDir, { recursive: true });
    await writeFile(inputFile, 'encrypted-content-placeholder');
  });

  afterEach(async () => {
    for (const f of [inputFile, outputFile, customOutput]) {
      await unlink(f).catch(() => {});
    }
  });

  it('calls sops --decrypt and writes output to default path', async (t) => {
    const expectedContent = 'decrypted: true\n';

    // Mock child_process.execFile at the module level via the sops module
    // We'll use a stub script approach: create a fake sops that echoes content
    const fakeSops = join(fixturesDir, 'fake-sops');
    await writeFile(fakeSops, `#!/bin/sh\necho "decrypted: true"`, { mode: 0o755 });

    // Temporarily prepend fixtures dir to PATH so our fake sops is found
    const origPath = process.env['PATH'];
    process.env['PATH'] = `${fixturesDir}:${origPath}`;

    // Rename fake-sops to sops
    const fakeSopsRenamed = join(fixturesDir, 'sops');
    await writeFile(fakeSopsRenamed, `#!/bin/sh\necho "decrypted: true"`, { mode: 0o755 });

    try {
      const result = await decryptSopsFile({ filePath: inputFile });
      assert.equal(result.outputPath, outputFile);
      const content = await readFile(outputFile, 'utf-8');
      assert.equal(content, expectedContent);
    } finally {
      process.env['PATH'] = origPath;
      await unlink(fakeSopsRenamed).catch(() => {});
      await unlink(fakeSops).catch(() => {});
    }
  });

  it('writes to custom output path when specified', async (t) => {
    const fakeSopsPath = join(fixturesDir, 'sops');
    await writeFile(fakeSopsPath, `#!/bin/sh\necho "custom output"`, { mode: 0o755 });

    const origPath = process.env['PATH'];
    process.env['PATH'] = `${fixturesDir}:${origPath}`;

    try {
      const result = await decryptSopsFile({ filePath: inputFile, outputPath: customOutput });
      assert.equal(result.outputPath, customOutput);
      const content = await readFile(customOutput, 'utf-8');
      assert.equal(content, 'custom output\n');
    } finally {
      process.env['PATH'] = origPath;
      await unlink(fakeSopsPath).catch(() => {});
    }
  });

  it('throws when sops command fails', async (t) => {
    const fakeSopsPath = join(fixturesDir, 'sops');
    await writeFile(fakeSopsPath, `#!/bin/sh\necho "error" >&2; exit 1`, { mode: 0o755 });

    const origPath = process.env['PATH'];
    process.env['PATH'] = `${fixturesDir}:${origPath}`;

    try {
      await assert.rejects(
        () => decryptSopsFile({ filePath: inputFile }),
        (err: Error) => {
          assert.ok(err.message.includes('error') || err.message.includes('Command failed'));
          return true;
        },
      );
    } finally {
      process.env['PATH'] = origPath;
      await unlink(fakeSopsPath).catch(() => {});
    }
  });
});
