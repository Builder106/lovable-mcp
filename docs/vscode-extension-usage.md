# Lovable.dev VS Code Extension

## Overview

The Lovable.dev extension brings powerful UI/UX development tools directly into Visual Studio Code. Using the Model Context Protocol (MCP), this extension helps you create beautiful, accessible, and consistent user interfaces with ease.

## Features

### 1. Component Generation 🧩

Generate custom UI components that follow your design system guidelines and accessibility standards with a few clicks.

![Component Generation](./images/component-generation.png)

### 2. Design Pattern Implementation 🏗️

Apply proven design patterns to your existing components to improve their architecture and reusability.

![Pattern Implementation](./images/pattern-implementation.png)

### 3. UI/UX Bug Detection 🐞

Identify potential UI/UX issues, accessibility violations, and inconsistencies in your code with automated analysis.

![Bug Detection](./images/bug-detection.png)

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Lovable.dev"
4. Click Install

## Configuration

The extension can be configured through VS Code's settings:

```json
{
  "lovable.designSystem": "tailwind",
  "lovable.uiFramework": "react",
  "lovable.accessibilityLevel": "AA"
}
```

Available options:

- **Design Systems**: tailwind, bootstrap, material, custom
- **UI Frameworks**: react, vue, angular, svelte
- **Accessibility Levels**: A, AA, AAA

## Usage

### Generating UI Components

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Lovable: Generate Component"
3. Enter the component name (e.g., "Button", "Card", "Dropdown")
4. Provide a brief description of the component
5. The component will be generated and opened in a new editor
6. A preview of the component will appear in a separate panel

![Component Preview](./images/component-preview.png)

### Applying Design Patterns

1. Select the code you want to transform
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type "Lovable: Apply Pattern"
4. Choose the pattern you want to apply:
   - Container/Presentational
   - Compound Component
   - Render Props
   - Custom Hook
   - Context Provider
5. The pattern will be applied to your selected code
6. A visualization of the pattern will appear in a separate panel

![Pattern Visualization](./images/pattern-visualization.png)

### Detecting UI/UX Issues

1. Open the file you want to analyze
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Type "Lovable: Detect Issues"
4. The extension will analyze your code and display issues as VS Code diagnostics
5. Hover over the underlined code to see details about the issue
6. Click on the lightbulb icon or press (`Ctrl+.` / `Cmd+.`) to see suggested fixes

![Issue Detection](./images/issue-detection.png)

## Supported File Types

- JavaScript (.js)
- TypeScript (.ts)
- JSX (.jsx)
- TSX (.tsx)
- Vue (.vue)
- CSS/SCSS/Less (.css, .scss, .less)
- HTML (.html)

## Examples

### Component Generation Example

Generating a Button component with Tailwind CSS:

```tsx
import React from 'react';

/**
 * A primary button with hover and focus states
 *
 * @component Button
 * @accessibility AA
 */
export const Button = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`rounded-md px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${className}`}
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

### Design Pattern Example

Applying the Container/Presentational pattern to a component:

```tsx
// Container Component
import React, { useState, useEffect } from 'react';
import { UserListPresentation } from './UserListPresentation';

/**
 * Container component that handles data fetching and state
 */
export const UserListContainer = (props) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Data fetching logic would go here
    fetch('/api/users')
      .then(response => response.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // Pass data down to presentational component
  return (
    <UserListPresentation
      data={data}
      loading={loading}
      error={error}
      {...props}
    />
  );
};
```

## Troubleshooting

### Common Issues

1. **Extension not working with your framework**
   - Check that you've set the correct UI framework in the settings

2. **Component preview not showing**
   - Make sure you have a stable internet connection (preview loads external dependencies)
   - Try regenerating the component

3. **False positives in bug detection**
   - You can add comments to suppress specific warnings: `// lovable-ignore: rule-id`

## Feedback and Support

- File issues on [GitHub](https://github.com/lovable-dev/lovable-mcp)
- Contact support at support@lovable.dev