import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile } from 'node:fs/promises';
import { resolve, dirname, basename, extname } from 'node:path';

const execFileAsync = promisify(execFile);

export interface DecryptOptions {
  filePath: string;
  outputPath?: string;
}

export interface DecryptResult {
  outputPath: string;
}

export async function decryptSopsFile(options: DecryptOptions): Promise<DecryptResult> {
  const absoluteInput = resolve(options.filePath);
  const outputPath = options.outputPath
    ? resolve(options.outputPath)
    : defaultOutputPath(absoluteInput);

  const { stdout } = await execFileAsync('sops', ['--decrypt', absoluteInput]);
  await writeFile(outputPath, stdout, 'utf-8');

  return { outputPath };
}

function defaultOutputPath(inputPath: string): string {
  const dir = dirname(inputPath);
  const ext = extname(inputPath);
  const name = basename(inputPath, ext);
  return resolve(dir, `${name}.decrypted${ext}`);
}
