import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { bulkRead } from "./bulk-read.js";

const server = new McpServer({
  name: "altudo-ai-cost-optimizer",
  version: "0.1.0"
});

server.registerTool(
  "altudo_bulk_read",
  {
    title: "Altudo Bulk Read",
    description:
      "Reads a large source file through the Altudo AI Cost Optimizer and returns compact structural information instead of loading the entire file into the main Cursor model context.",
    inputSchema: {
      file_path: z.string().describe("Absolute or workspace-relative path to the file")
    }
  },
  async ({ file_path }) => {
    try {
      const result = bulkRead(file_path);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Altudo bulk read failed: ${message}`
          }
        ]
      };
    }
  }
);

const transport = new StdioServerTransport();

await server.connect(transport);