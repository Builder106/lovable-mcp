#!/usr/bin/env node

import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import config from './server/config.js';
import { generateComponent } from './tools/component_gen.js';
import { applyPattern } from './tools/pattern_impl.js';
import { detectBugs } from './tools/bug_detector.js';

const app = express();
const port = config.port || 3000;

const server = new Server({
  name: 'lovable-ui',
  version: '1.0.0',
  tools: {
    generate_component: generateComponent,
    apply_pattern: applyPattern,
    detect_bugs: detectBugs,
  },
  auth: {
    type: 'api_key',
    required: true,
  },
});

const transport = new StdioServerTransport();
server.connect(transport);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
