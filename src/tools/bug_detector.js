/**
 * Bug detection tool for MCP
 * Enhanced for IDE integration with diagnostics API
 */
export async function detectBugs(data) {
  const {
    code = '',
    fileName = 'unknown',
    designSystem = 'tailwind',
    framework = 'react'
  } = data;
  
  console.log(`Analyzing ${framework} code for UI/UX issues`);
  
  // Determine the type of file to apply appropriate rules
  const fileType = determineFileType(fileName, framework);
  
  // Get the appropriate rule set based on framework and design system
  const rules = getRules(framework, designSystem, fileType);
  
  // Analyze the code for issues
  const issues = [];
  
  for (const rule of rules) {
    try {
      const detected = rule.detect(code);
      if (detected) {
        issues.push({
          code: rule.code,
          message: rule.message,
          severity: rule.severity,
          location: detected.location,
          suggestions: rule.suggestions || []
        });
      }
    } catch (error) {
      console.error(`Error applying rule ${rule.code}: ${error}`);
    }
  }
  
  // Return issues in format compatible with VS Code Diagnostics
  return issues;
}

// Helper for determining file type
function determineFileType(fileName, framework) {
  const extension = fileName.split('.').pop().toLowerCase();
  
  if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
    return 'component';
  } else if (['css', 'scss', 'less'].includes(extension)) {
    return 'style';
  } else if (['html'].includes(extension)) {
    return 'markup';
  }
  
  // Framework-specific guesses if extension doesn't tell us enough
  if (framework === 'react') {
    return 'component';
  } else if (framework === 'vue' && extension === 'vue') {
    return 'vue-component';
  }
  
  return 'unknown';
}

// Return appropriate rules based on framework, design system and file type
function getRules(framework, designSystem, fileType) {
  // Base rules that apply to all
  const baseRules = [
    {
      code: 'lovable-access-001',
      name: 'Missing alt text',
      detect: (code) => {
        const imgRegex = /<img\s+(?![^>]*alt=)[^>]*>/i;
        const match = code.match(imgRegex);
        
        if (match) {
          const line = getLineNumber(code, match.index);
          const startColumn = getColumnNumber(code, match.index);
          const endColumn = startColumn + match[0].length;
          
          return {
            location: {
              startLine: line,
              startColumn,
              endLine: line,
              endColumn
            }
          };
        }
        
        return null;
      },
      message: 'Image is missing alt text which is required for accessibility',
      severity: 'error',
      suggestions: [
        'Add an alt attribute that describes the image',
        'If the image is decorative, use alt=""'
      ]
    },
    {
      code: 'lovable-access-002',
      name: 'Low contrast text',
      detect: (code) => {
        // Simplified check for potential low contrast in tailwind classes
        const lowContrastPattern = /text-(gray|yellow|blue)-(100|200).*bg-(gray|yellow|blue)-(100|200|300)/i;
        const match = code.match(lowContrastPattern);
        
        if (match) {
          const line = getLineNumber(code, match.index);
          const startColumn = getColumnNumber(code, match.index);
          const endColumn = startColumn + match[0].length;
          
          return {
            location: {
              startLine: line,
              startColumn,
              endLine: line,
              endColumn
            }
          };
        }
        
        return null;
      },
      message: 'Potential low contrast between text and background colors',
      severity: 'warning',
      suggestions: [
        'Use darker text colors with light backgrounds (e.g., text-gray-800)',
        'Use lighter text colors with dark backgrounds (e.g., text-white)',
        'Ensure contrast ratio of at least 4.5:1 for normal text'
      ]
    }
  ];
  
  // Framework-specific rules
  const frameworkRules = {
    react: [
      {
        code: 'lovable-react-001',
        name: 'Missing key in list',
        detect: (code) => {
          const mapWithoutKeyPattern = /\.map\(\s*\(\s*[^)]+\)\s*=>\s*<[^>]*(?!key=)[^>]*>/g;
          const match = code.match(mapWithoutKeyPattern);
          
          if (match) {
            const line = getLineNumber(code, match.index);
            const startColumn = getColumnNumber(code, match.index);
            const endColumn = startColumn + match[0].length;
            
            return {
              location: {
                startLine: line,
                startColumn,
                endLine: line,
                endColumn
              }
            };
          }
          
          return null;
        },
        message: 'List items should have unique "key" props',
        severity: 'error',
        suggestions: [
          'Add a key prop with a unique identifier',
          'Use array index as a last resort if items never reorder'
        ]
      }
    ],
    vue: [
      {
        code: 'lovable-vue-001',
        name: 'Missing key in v-for',
        detect: (code) => {
          const vForWithoutKeyPattern = /v-for((?!:key|v-bind:key|:key).)*>/g;
          const match = code.match(vForWithoutKeyPattern);
          
          if (match) {
            const line = getLineNumber(code, match.index);
            const startColumn = getColumnNumber(code, match.index);
            const endColumn = startColumn + match[0].length;
            
            return {
              location: {
                startLine: line,
                startColumn,
                endLine: line,
                endColumn
              }
            };
          }
          
          return null;
        },
        message: 'v-for directives should have accompanying :key',
        severity: 'error',
        suggestions: [
          'Add :key directive with a unique identifier',
          'Use item.id for the key if available'
        ]
      }
    ]
  };
  
  // Design system specific rules
  const designSystemRules = {
    tailwind: [
      {
        code: 'lovable-tailwind-001',
        name: 'Inconsistent spacing',
        detect: (code) => {
          const mixedSpacingPattern = /(p[xy]?-[0-9].*m[xy]?-[0-9])|(m[xy]?-[0-9].*p[xy]?-[0-9])/g;
          const match = code.match(mixedSpacingPattern);
          
          if (match) {
            const line = getLineNumber(code, match.index);
            const startColumn = getColumnNumber(code, match.index);
            const endColumn = startColumn + match[0].length;
            
            return {
              location: {
                startLine: line,
                startColumn,
                endLine: line,
                endColumn
              }
            };
          }
          
          return null;
        },
        message: 'Inconsistent spacing values may affect UI predictability',
        severity: 'warning',
        suggestions: [
          'Use consistent spacing values from the design system',
          'Consider using spacing scale variables instead of hard-coded values'
        ]
      }
    ],
    bootstrap: [
      {
        code: 'lovable-bootstrap-001',
        name: 'Missing responsive classes',
        detect: (code) => {
          const nonResponsiveColumnsPattern = /col-[0-9]+(?!.*col-[a-z]+)/g;
          const match = code.match(nonResponsiveColumnsPattern);
          
          if (match) {
            const line = getLineNumber(code, match.index);
            const startColumn = getColumnNumber(code, match.index);
            const endColumn = startColumn + match[0].length;
            
            return {
              location: {
                startLine: line,
                startColumn,
                endLine: line,
                endColumn
              }
            };
          }
          
          return null;
        },
        message: 'Bootstrap columns should include responsive breakpoints',
        severity: 'warning',
        suggestions: [
          'Add responsive column classes like col-sm-, col-md-, etc.',
          'Consider how the layout will adapt on different screen sizes'
        ]
      }
    ]
  };
  
  // File type specific rules
  const fileTypeRules = {
    component: [
      {
        code: 'lovable-component-001',
        name: 'Prop type missing',
        detect: (code) => {
          if (framework !== 'react') return null;
          
          const propsMissingTypePattern = /const\s+\w+\s*=\s*\(\s*{\s*([^}:]+)\s*}\s*\)\s*=>/g;
          const match = code.match(propsMissingTypePattern);
          
          if (match) {
            const line = getLineNumber(code, match.index);
            const startColumn = getColumnNumber(code, match.index);
            const endColumn = startColumn + match[0].length;
            
            return {
              location: {
                startLine: line,
                startColumn,
                endLine: line,
                endColumn
              }
            };
          }
          
          return null;
        },
        message: 'Component is missing prop type definitions',
        severity: 'warning',
        suggestions: [
          'Add PropTypes or TypeScript types to your component props',
          'Document the expected prop types and defaults'
        ]
      }
    ],
    style: [
      {
        code: 'lovable-style-001',
        name: 'Hard-coded color values',
        detect: (code) => {
          const hardcodedColorPattern = /#[0-9a-f]{3,6}|rgba?\s*\([^)]+\)/gi;
          const match = code.match(hardcodedColorPattern);
          
          if (match) {
            const line = getLineNumber(code, match.index);
            const startColumn = getColumnNumber(code, match.index);
            const endColumn = startColumn + match[0].length;
            
            return {
              location: {
                startLine: line,
                startColumn,
                endLine: line,
                endColumn
              }
            };
          }
          
          return null;
        },
        message: 'Hard-coded color values reduce maintainability',
        severity: 'warning',
        suggestions: [
          'Use design system color variables',
          'Create a color palette with semantic names'
        ]
      }
    ]
  };
  
  // Combine all applicable rules
  let applicableRules = [...baseRules];
  
  if (frameworkRules[framework]) {
    applicableRules = [...applicableRules, ...frameworkRules[framework]];
  }
  
  if (designSystemRules[designSystem]) {
    applicableRules = [...applicableRules, ...designSystemRules[designSystem]];
  }
  
  if (fileTypeRules[fileType]) {
    applicableRules = [...applicableRules, ...fileTypeRules[fileType]];
  }
  
  return applicableRules;
}

// Helper functions to get line and column numbers
function getLineNumber(text, index) {
  const textUpToIndex = text.substring(0, index);
  return (textUpToIndex.match(/\n/g) || []).length;
}

function getColumnNumber(text, index) {
  const textUpToIndex = text.substring(0, index);
  const lastNewLine = textUpToIndex.lastIndexOf('\n');
  return lastNewLine === -1 ? index : index - lastNewLine - 1;
}