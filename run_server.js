const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Verify server file exists
const serverPath = path.join(__dirname, 'dist/index.js');
if (!fs.existsSync(serverPath)) {
    console.error(`Error: Server file not found at ${serverPath}. Please run 'npm run build' first.`);
    process.exit(1);
}

// Start Node.js server
const server = spawn('node', [serverPath]);
console.log('Starting lovable.dev MCP server...');

// Forward server output
server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
        console.log(`[Server]: ${output}`);
    }
});

server.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
        console.error(`[Server Error]: ${error}`);
    }
});

// Handle spawn error
server.on('error', (error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
});

// Handle server exit
server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
    server.kill('SIGINT');
});

// Export server info for MCP Inspector
module.exports = {
    name: 'lovable.dev',
    version: '1.0.0',
    transport: 'stdio'
};
