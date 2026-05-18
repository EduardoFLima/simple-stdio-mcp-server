import { z } from 'zod';
import { decryptSopsFile } from './sops.ts';

export const sopsDecryptTool = {
  name: 'sops_decrypt',
  config: {
    description: 'Decrypt a SOPS-encrypted file and write the plaintext to disk',
    inputSchema: {
      filePath: z.string().describe('Path to the SOPS-encrypted file'),
      outputPath: z.string().optional().describe('Path to write the decrypted output. Defaults to <name>.decrypted.<ext> next to the input file'),
    },
  },
  handler: async ({ filePath, outputPath }: { filePath: string; outputPath?: string }) => {
    try {
      const result = await decryptSopsFile({ filePath, outputPath });
      return {
        content: [{ type: 'text' as const, text: `Decrypted file written to: ${result.outputPath}` }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text' as const, text: `Failed to decrypt: ${message}` }],
        isError: true,
      };
    }
  },
};
