# Lovable.dev MCP IDE Integration

This project implements a Model Context Protocol (MCP) integration for Lovable.dev, bringing powerful UI/UX development tools directly into your IDE.

## Overview

Lovable.dev's MCP integration provides developers with intelligent UI/UX tooling directly within their development environment. Instead of running as a standalone server, this implementation leverages the Model Context Protocol to seamlessly integrate with modern IDEs.

## Features

- **UI Component Generation**: Create accessible, consistent UI components that follow your design system
- **Design Pattern Implementation**: Apply common UI/UX patterns with automatic implementation
- **Bug Detection & Fixes**: Identify UI/UX inconsistencies and get automated fix suggestions

## IDE Support

- Visual Studio Code
- JetBrains IDEs (WebStorm, IntelliJ, etc.)
- (Additional IDEs planned)

## Installation

### Prerequisites

- Node.js 14+
- TypeScript 4+
- Your favorite MCP-compatible IDE

### Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```
4. Configure your IDE to use the Lovable.dev MCP extension

## Configuration

The MCP extension can be configured through your IDE's settings:

```json
{
  "lovable.designSystem": "tailwind",  // Your preferred design system
  "lovable.uiFramework": "react",      // Your UI framework (react, vue, angular, etc.)
  "lovable.accessibilityLevel": "AA"   // Desired accessibility compliance level
}
```

## Usage

### Generating Components

Access the command palette in your IDE and select "Lovable: Generate Component". Follow the prompts to specify your component requirements.

### Applying Design Patterns

Select code in your editor and use the command palette to choose "Lovable: Apply Pattern". Select from common UI/UX patterns to apply to your selection.

### Detecting UI/UX Issues

Run "Lovable: Detect Issues" from the command palette to scan your project for potential UI/UX problems and receive suggestions for fixes.

## Development

### Project Structure

```
lovable-mcp/
├── src/             # Source code
├── config/          # MCP configuration
├── tests/           # Test files
└── docs/            # Documentation
```

### Building

```
npm run build
```

### Testing

```
npm run test
```

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.