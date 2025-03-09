#!/usr/bin/env node
import { PluginClient } from '@modelcontextprotocol/sdk/plugin';
import { StdioPluginTransport } from '@modelcontextprotocol/sdk/plugin/stdio';
import { generateComponent } from './tools/component_gen.js';
import { applyPattern } from './tools/pattern_impl.js';
import { detectBugs } from './tools/bug_detector.js';
import { initializeLogger } from './utils/logger.js';

// Initialize logger for IDE integration
const logger = initializeLogger('lovable-mcp-plugin');

// Create MCP plugin client
const client = new PluginClient({
  name: 'lovable-ui',
  version: '1.0.0',
  tools: {
    generate_component: generateComponent,
    apply_pattern: applyPattern,
    detect_bugs: detectBugs,
  }
});

// Connect to IDE using stdio transport
const transport = new StdioPluginTransport();

// Initialize plugin and handle any errors
try {
  client.connect(transport);
  logger.info('Lovable.dev MCP plugin initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Lovable.dev MCP plugin', error);
  process.exit(1);
}

// Graceful shutdown handling
process.on('SIGINT', () => {
  logger.info('Shutting down Lovable.dev MCP plugin');
  client.disconnect();
  process.exit(0);
});
