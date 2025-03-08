declare module '@modelcontextprotocol/sdk';
declare module '@modelcontextprotocol/sdk/server' {
  export class Server {
    constructor(options: {
      name: string;
      version: string;
      tools: Record<string, Function>;
      auth?: {
        type: string;
        required: boolean;
      };
    });
    connect(transport: any): void;
  }
}
declare module '@modelcontextprotocol/sdk/server/stdio' {
  export class StdioServerTransport {
    constructor();
  }
}
