import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { sopsDecryptTool } from './sops-decrypt-tool.ts';

const server = new McpServer({
  name: 'sops-decrypt',
  version: '1.0.0',
});

server.registerTool(
  sopsDecryptTool.name,
  sopsDecryptTool.config,
  sopsDecryptTool.handler,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
