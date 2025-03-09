/**
 * Type definitions for Model Context Protocol with IDE integration
 */

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

/**
 * Basic MCP interfaces
 */
declare module '@modelcontextprotocol/sdk/plugin' {
  export interface PluginClient {
    new(options: PluginOptions): PluginClient;
    connect(transport: any): void;
    disconnect(): void;
  }
  
  export interface PluginOptions {
    name: string;
    version: string;
    tools: Record<string, ToolFunction>;
  }
  
  export type ToolFunction = (data: any) => Promise<any>;
}

declare module '@modelcontextprotocol/sdk/plugin/stdio' {
  export class StdioPluginTransport {
    new(): StdioPluginTransport;
  }
}

/**
 * Lovable tool interfaces
 */
export namespace LovableTools {
  /**
   * Component Generation
   */
  export interface GenerateComponentInput {
    name: string;
    description?: string;
    designSystem?: string;
    framework?: string;
    accessibilityLevel?: string;
    props?: Record<string, PropDefinition>;
  }
  
  export interface PropDefinition {
    type: string;
    description?: string;
    required?: boolean;
    defaultValue?: any;
  }
  
  export interface GenerateComponentOutput {
    success: boolean;
    name: string;
    framework: string;
    designSystem: string;
    code: string;
  }
  
  /**
   * Pattern Implementation
   */
  export interface ApplyPatternInput {
    code: string;
    pattern: string; 
    framework?: string;
  }
  
  export interface ApplyPatternOutput {
    success: boolean;
    originalPattern: string;
    framework: string;
    code: string;
    visualizationData: PatternVisualizationData;
  }
  
  export interface PatternVisualizationData {
    type: string;
    components: string[];
    dataFlow: string;
    diagram: {
      nodes: DiagramNode[];
      edges: DiagramEdge[];
    };
  }
  
  export interface DiagramNode {
    id: string;
    label: string;
    type?: string;
  }
  
  export interface DiagramEdge {
    from: string;
    to: string;
    label?: string;
  }
  
  /**
   * Bug Detection
   */
  export interface DetectBugsInput {
    code: string;
    fileName?: string;
    designSystem?: string;
    framework?: string;
  }
  
  export interface DetectBugsOutput {
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    location: CodeLocation;
    suggestions?: string[];
  }
  
  export interface CodeLocation {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  }
}

/**
 * VS Code specific types for extension integration
 */
export namespace LovableIDE {
  /**
   * Component preview
   */
  export interface ComponentPreviewOptions {
    code: string;
    metadata: {
      name: string;
      framework: string;
      designSystem: string;
    };
  }
  
  /**
   * Pattern visualization
   */
  export interface PatternVisualizationOptions {
    patternName: string;
    visualizationData: LovableTools.PatternVisualizationData;
  }
  
  /**
   * Diagnostic support
   */
  export interface DiagnosticOptions {
    code: string;
    fileName: string;
    designSystem: string;
    framework: string;
  }
  
  export interface DiagnosticResult {
    issues: LovableTools.DetectBugsOutput[];
  }
}
