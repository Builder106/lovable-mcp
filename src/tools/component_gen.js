/**
 * Component generator tool for MCP
 */
export function generateComponent(data) {
  console.log('Generating component with data:', data);
  return {
    success: true,
    component: {
      name: data.name || 'DefaultComponent',
      type: data.type || 'functional',
      code: `// Generated component code for ${data.name || 'DefaultComponent'}`
    }
  };
}