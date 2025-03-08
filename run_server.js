const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Verify server file exists
const serverPath = path.join(__dirname, 'src/server/server.py');
if (!fs.existsSync(serverPath)) {
    console.error(`Error: Server file not found at ${serverPath}`);
    process.exit(1);
}

// Try different Python commands
const pythonCommands = ['python3', 'python'];
let pythonServer;

for (const cmd of pythonCommands) {
    try {
        pythonServer = spawn(cmd, [serverPath]);
        // If we get here, the spawn was successful
        console.log(`Successfully started server using ${cmd}`);
        break;
    } catch (error) {
        console.log(`Failed to start with ${cmd}: ${error.message}`);
        if (cmd === pythonCommands[pythonCommands.length - 1]) {
            console.error('Error: Could not find Python interpreter. Please ensure Python is installed and in your PATH.');
            process.exit(1);
        }
        continue;
    }
}

// Forward Python server output
pythonServer.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
        console.log(`[Python Server]: ${output}`);
    }
});

pythonServer.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
        console.error(`[Python Server Error]: ${error}`);
    }
});

// Handle spawn error
pythonServer.on('error', (error) => {
    console.error(`Failed to start Python server: ${error.message}`);
    process.exit(1);
});

// Handle server exit
pythonServer.on('close', (code) => {
  console.log(`Python server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  pythonServer.kill('SIGINT');
});

// Export server info for MCP Inspector
module.exports = {
  port: 3000,
  host: 'localhost',
  protocol: 'http'
};
